'use strict';

/**
 * Mail transport service supporting both SMTP (Nodemailer) and Resend HTTPS API.
 *
 * Configured for Resend / Gmail. If `SMTP_PASS` is a Resend API key (`re_...`),
 * emails are sent via HTTPS (Port 443) to guarantee delivery even on cloud
 * hosts (like Render free tier) that block outbound SMTP ports.
 */
const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const logger = require('../utils/logger');
const { buildAutoReplyEmail, buildNotificationEmail } = require('./emailTemplates');

let transporter = null;
/** True when the active transport is the Ethereal stand-in, not the real one. */
let isFallbackTransport = false;

const fallbackAllowed = !env.isProduction && process.env.MAIL_DEV_FALLBACK !== 'false';

/** Lazily created and reused for standard SMTP. */
function getTransporter() {
  if (transporter) return transporter;
  if (!env.isMailConfigured) return null;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
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

/** Sends an email payload directly via Resend HTTPS API (Port 443 - unblocked). */
async function sendResendApiMail({ from, to, replyTo, subject, text, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.smtp.pass}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || data.error?.message || `Resend API HTTP ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
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
 * Verifies credentials at boot rather than on the first enquiry.
 */
async function verifyMailer() {
  const isResendKey = Boolean(env.smtp.pass && env.smtp.pass.startsWith('re_'));

  if (isResendKey) {
    isFallbackTransport = false;
    logger.info(`[mail] Resend HTTPS API ready (sending as ${env.smtp.fromAddress}).`);
    return true;
  }

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
 */
async function sendEnquiryEmails(enquiry) {
  const isResendKey = Boolean(env.smtp.pass && env.smtp.pass.startsWith('re_'));
  const transport = getTransporter();

  if (!transport && !isResendKey) {
    return { notification: 'skipped', autoReply: 'skipped', error: 'Mail transport not configured.' };
  }

  const from = isFallbackTransport
    ? `"${env.smtp.fromName} (dev)" <no-reply@ethereal.email>`
    : `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`;

  const notification = buildNotificationEmail(enquiry);
  const autoReply = buildAutoReplyEmail(enquiry);

  const useHttpsApi = isResendKey && !isFallbackTransport;

  const notificationPromise = useHttpsApi
    ? sendResendApiMail({
        from,
        to: env.enquiryRecipient,
        replyTo: `"${enquiry.fullName}" <${enquiry.email}>`,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      })
    : transport.sendMail({
        from,
        to: env.enquiryRecipient,
        replyTo: `"${enquiry.fullName}" <${enquiry.email}>`,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      });

  const autoReplyPromise = useHttpsApi
    ? sendResendApiMail({
        from,
        to: enquiry.email,
        replyTo: env.enquiryRecipient,
        subject: autoReply.subject,
        text: autoReply.text,
        html: autoReply.html,
      })
    : transport.sendMail({
        from,
        to: enquiry.email,
        replyTo: env.enquiryRecipient,
        subject: autoReply.subject,
        text: autoReply.text,
        html: autoReply.html,
        headers: {
          'Auto-Submitted': 'auto-replied',
          'X-Auto-Response-Suppress': 'All',
        },
      });

  const [notificationResult, autoReplyResult] = await Promise.allSettled([
    notificationPromise,
    autoReplyPromise,
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
