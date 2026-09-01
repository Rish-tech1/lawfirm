

'use strict';

/**
 * SMTP transport via Nodemailer.
 *
 * Configured for Gmail, where the SMTP login is the mailbox and `SMTP_PASS` is
 * a 16-character App Password. The transport itself is provider-agnostic — the
 * SMTP *login* and the visible *sender* are separate settings (`smtp.user` vs
 * `smtp.fromAddress`) because some relays issue a login that is not a mailbox.
 * See README §"Email setup".
 *
 * Development fallback
 * --------------------
 * If the configured transport cannot be verified at boot — wrong password, an
 * un-allowlisted IP, a provider still pending activation — a development server
 * falls back to an Ethereal test inbox rather than leaving the contact form
 * broken. Ethereal accepts any mail and returns a preview URL instead of
 * delivering it, so the whole flow stays testable while the real provider is
 * being sorted out.
 *
 * This NEVER happens when NODE_ENV=production: silently diverting a client's
 * enquiry to a fake inbox would be far worse than failing loudly. Set
 * MAIL_DEV_FALLBACK=false to disable it in development too.
 */
const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const logger = require('../utils/logger');
const { buildAutoReplyEmail, buildNotificationEmail } = require('./emailTemplates');

let transporter = null;
/** True when the active transport is the Ethereal stand-in, not the real one. */
let isFallbackTransport = false;

const fallbackAllowed = !env.isProduction && process.env.MAIL_DEV_FALLBACK !== 'false';

/** Lazily created and reused, so the connection pool survives across requests. */
function getTransporter() {
  if (transporter) return transporter;
  if (!env.isMailConfigured) return null;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  return transporter;
}

/** Builds a throwaway Ethereal account and swaps it in as the active transport. */
async function useEtherealFallback(reason) {
  try {
    const account = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });

    isFallbackTransport = true;

    logger.warn('[mail] ----------------------------------------------------------');
    logger.warn(`[mail] Real transport unavailable (${reason}).`);
    logger.warn('[mail] Falling back to an Ethereal test inbox for development.');
    logger.warn('[mail] Emails are CAPTURED, NOT DELIVERED. Each send logs a preview URL.');
    logger.warn('[mail] Fix the real provider and restart to switch back automatically.');
    logger.warn('[mail] ----------------------------------------------------------');

    return true;
  } catch (error) {
    logger.error('[mail] Could not create Ethereal fallback account:', error.message);
    return false;
  }
}

/**
 * Verifies credentials at boot rather than on the first enquiry — a
 * misconfigured transport should show up in the deploy logs, not as a lost
 * client message hours later.
 */
async function verifyMailer() {
  const transport = getTransporter();

  if (!transport) {
    if (fallbackAllowed) return useEtherealFallback('no credentials configured');
    logger.warn('[mail] Transport not configured; enquiry emails are disabled.');
    return false;
  }

  try {
    await transport.verify();
    isFallbackTransport = false;
    logger.info(
      `[mail] SMTP ready via ${env.smtp.host} (login ${env.smtp.user}, sending as ${env.smtp.fromAddress}).`,
    );
    return true;
  } catch (error) {
    logger.error('[mail] SMTP verification failed:', error.message);

    if (fallbackAllowed) {
      transporter = null;
      return useEtherealFallback(error.message);
    }

    return false;
  }
}

/**
 * Sends the firm notification and the client acknowledgement.
 *
 * Never throws. The two sends are independent and settled in parallel, so a
 * bounced auto-reply (bad client address, say) still lets the firm's own
 * notification through. The caller records the returned statuses.
 */
async function sendEnquiryEmails(enquiry) {
  const transport = getTransporter();

  if (!transport) {
    return { notification: 'skipped', autoReply: 'skipped', error: 'Mail transport not configured.' };
  }

  const from = isFallbackTransport
    ? `"${env.smtp.fromName} (dev)" <no-reply@ethereal.email>`
    : // The verified sender, which is not necessarily the SMTP login.
    `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`;

  const notification = buildNotificationEmail(enquiry);
  const autoReply = buildAutoReplyEmail(enquiry);

  const [notificationResult, autoReplyResult] = await Promise.allSettled([
    transport.sendMail({
      from,
      to: env.enquiryRecipient,
      // Replying in the mail client goes to the enquirer, not back to ourselves.
      replyTo: `"${enquiry.fullName}" <${enquiry.email}>`,
      subject: notification.subject,
      text: notification.text,
      html: notification.html,
    }),

    transport.sendMail({
      from,
      to: enquiry.email,
      replyTo: env.enquiryRecipient,
      subject: autoReply.subject,
      text: autoReply.text,
      html: autoReply.html,
      headers: {
        // Stops out-of-office replies from bouncing back into the inbox.
        'Auto-Submitted': 'auto-replied',
        'X-Auto-Response-Suppress': 'All',
      },
    }),
  ]);

  const errors = [];

  if (notificationResult.status === 'rejected') {
    logger.error('[mail] Firm notification failed:', notificationResult.reason?.message);
    errors.push(`notification: ${notificationResult.reason?.message}`);
  } else {
    logger.info(`[mail] Firm notification sent for ${enquiry.email}.`);
    logPreview('Firm notification', notificationResult.value);
  }

  if (autoReplyResult.status === 'rejected') {
    logger.error('[mail] Client auto-reply failed:', autoReplyResult.reason?.message);
    errors.push(`autoReply: ${autoReplyResult.reason?.message}`);
  } else {
    logger.info(`[mail] Auto-reply sent to ${enquiry.email}.`);
    logPreview('Client auto-reply', autoReplyResult.value);
  }

  return {
    notification: notificationResult.status === 'fulfilled' ? 'sent' : 'failed',
    autoReply: autoReplyResult.status === 'fulfilled' ? 'sent' : 'failed',
    error: errors.length ? errors.join(' | ') : null,
  };
}

/** Prints the Ethereal preview link, which is the only way to read a captured email. */
function logPreview(label, info) {
  if (!isFallbackTransport || !info) return;
  const url = nodemailer.getTestMessageUrl(info);
  if (url) logger.warn(`[mail] ${label} preview: ${url}`);
}

/** Lets the health endpoint report that mail is working but only into a test inbox. */
function isUsingFallbackTransport() {
  return isFallbackTransport;
}

module.exports = { sendEnquiryEmails, verifyMailer, isUsingFallbackTransport };
