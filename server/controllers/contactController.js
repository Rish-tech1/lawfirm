'use strict';

const Enquiry = require('../models/Enquiry');
const { isDatabaseReady } = require('../config/db');
const { sendEnquiryEmails } = require('../services/mailer');
const { verifyRecaptcha } = require('../services/recaptcha');
const { ApiError, asyncHandler } = require('../utils/ApiError');
const { contactSchema, formatZodErrors } = require('../utils/validators');
const logger = require('../utils/logger');

/** A human cannot read the form and fill six fields in under three seconds. */
const MIN_ELAPSED_MS = 3000;

/** Window in which an identical enquiry from the same address is a double-submit. */
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

/**
 * Success response used for both real submissions and silently-dropped spam.
 *
 * Bots are told the same thing as clients on purpose: a distinct rejection
 * message tells an attacker exactly which check caught them and what to change.
 */
const SUCCESS_RESPONSE = {
  success: true,
  message:
    'Thank you — your enquiry has been received. We will respond within one working day, and a confirmation email is on its way.',
};

/**
 * Records a submission the spam screen rejected, then lets the caller answer as
 * though it were accepted.
 *
 * Storing it is the whole point. These heuristics have false positives — a
 * password manager filling every field in under three seconds, a browser
 * extension populating the honeypot — and the response deliberately does not
 * say so. Without this, such a client is told "your enquiry has been received"
 * while it is dropped on the floor, which for a law firm is the worst failure
 * this endpoint has. Flagged `spam` so it stays out of the live inbox but is
 * still recoverable.
 */
async function recordScreenedSubmission(enquiryData, reason) {
  if (!isDatabaseReady()) {
    logger.warn(`[contact] Screened submission (${reason}) NOT stored — database unavailable.`);
    return;
  }

  try {
    const screened = await Enquiry.create({
      ...enquiryData,
      status: 'spam',
      emailStatus: {
        notification: 'skipped',
        autoReply: 'skipped',
        error: `Screened by spam filter: ${reason}`,
      },
    });
    logger.warn(`[contact] Screened submission stored as ${screened._id} (${reason}).`);
  } catch (error) {
    logger.error('[contact] Could not store screened submission:', error.message);
  }
}

/**
 * POST /api/contact
 *
 * Validate, screen for spam, persist, then email. Persisting before emailing is
 * deliberate: if SMTP fails the enquiry is still on record and recoverable,
 * whereas the reverse ordering would lose it.
 */
const submitEnquiry = asyncHandler(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    throw ApiError.validation(
      'Please correct the highlighted fields and try again.',
      formatZodErrors(parsed.error),
    );
  }

  const { website, elapsedMs, recaptchaToken, ...payload } = parsed.data;

  const ip = req.ip || req.socket?.remoteAddress || null;
  const userAgent = req.get('user-agent') || null;

  /** Shared by the screened and accepted paths; recaptchaScore is filled in below. */
  const baseData = {
    ...payload,
    meta: {
      ip,
      userAgent,
      referer: req.get('referer') || null,
      recaptchaScore: null,
    },
  };

  /* --- Spam screening ----------------------------------------------------- */

  // 1. Honeypot: a hidden field only an automated client would populate.
  if (website) {
    logger.warn(`[contact] Honeypot triggered (ip=${ip}); screening submission.`);
    await recordScreenedSubmission(baseData, 'honeypot field populated');
    return res.status(200).json(SUCCESS_RESPONSE);
  }

  // 2. Timing: an implausibly fast submission is scripted.
  if (typeof elapsedMs === 'number' && elapsedMs < MIN_ELAPSED_MS) {
    logger.warn(`[contact] Submitted in ${elapsedMs}ms (ip=${ip}); screening submission.`);
    await recordScreenedSubmission(baseData, `submitted in ${elapsedMs}ms`);
    return res.status(200).json(SUCCESS_RESPONSE);
  }

  // 3. reCAPTCHA v3, when configured.
  const recaptcha = await verifyRecaptcha(recaptchaToken, ip);

  if (!recaptcha.ok) {
    logger.warn(`[contact] reCAPTCHA blocked submission (${recaptcha.reason}, ip=${ip}).`);
    throw ApiError.badRequest(
      'We could not verify this submission as human. Please reload the page and try again, or contact us by phone.',
    );
  }

  /* --- Persist ------------------------------------------------------------ */

  const enquiryData = {
    ...baseData,
    meta: { ...baseData.meta, recaptchaScore: recaptcha.score },
  };

  let enquiry = null;

  if (isDatabaseReady()) {
    // Treat an identical resubmission within the window as a double-click.
    const duplicate = await Enquiry.findOne({
      email: payload.email,
      subject: payload.subject,
      createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    })
      .select('_id')
      .lean();

    if (duplicate) {
      logger.info(`[contact] Duplicate submission from ${payload.email} ignored.`);
      return res.status(200).json(SUCCESS_RESPONSE);
    }

    enquiry = await Enquiry.create(enquiryData);
    logger.info(`[contact] Enquiry ${enquiry._id} stored (${payload.practiceArea}).`);
  } else {
    logger.warn('[contact] Database unavailable; proceeding with email only.');
  }

  /* --- Notify ------------------------------------------------------------- */

  // The email payload is the same shape whether or not it came from Mongo.
  const emailPayload = enquiry ? enquiry.toObject() : { ...enquiryData, createdAt: new Date() };
  const emailStatus = await sendEnquiryEmails(emailPayload);

  if (enquiry) {
    // Recorded, not awaited-on-failure: the client should not see a 500 because
    // we could not annotate our own record after successfully taking the enquiry.
    Enquiry.updateOne({ _id: enquiry._id }, { $set: { emailStatus } })
      .exec()
      .catch((error) => logger.error('[contact] Could not record email status:', error.message));
  }

  /**
   * If the enquiry was neither stored nor emailed, it is gone — that is the one
   * case where the client must be told to use another channel.
   */
  const persisted = Boolean(enquiry);
  const notified = emailStatus.notification === 'sent';

  if (!persisted && !notified) {
    logger.error('[contact] Enquiry could not be stored or emailed; informing client.');
    throw ApiError.internal(
      'We could not record your enquiry just now. Please call the office or message us on WhatsApp so it is not lost.',
    );
  }

  return res.status(201).json(SUCCESS_RESPONSE);
});

module.exports = { submitEnquiry };
