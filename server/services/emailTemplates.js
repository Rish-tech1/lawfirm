'use strict';

/**
 * Transactional email templates.
 *
 * Written as table-based HTML with inline styles: Outlook and several webmail
 * clients strip <style> blocks and ignore flexbox, so anything more modern
 * would render as unstyled text for a meaningful share of recipients. Each
 * template also returns a plain-text alternative for accessibility, spam
 * scoring and text-only clients.
 *
 * All interpolated enquiry values are escaped — the content is supplied by an
 * untrusted form and read inside an HTML email.
 */
const { escapeHtml, escapeHtmlMultiline } = require('../utils/validators');
const { env } = require('../config/env');

const INK = '#111111';
const GOLD = '#C8A75B';
const MUTED = '#5c5c5c';
const LINE = '#e4e1da';

const FIRM_NAME = env.smtp.fromName;

function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/** Shared dark header with the scales mark and firm name. */
function header(subtitle) {
  return `
    <tr>
      <td style="background:${INK};padding:32px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:14px;vertical-align:middle;">
              <img src="${env.siteUrl}/images/logo-mark.svg" width="40" height="40" alt="" style="display:block;border:0;" />
            </td>
            <td style="vertical-align:middle;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#ffffff;line-height:1.2;">
                Singla <span style="color:${GOLD};">&amp;</span> Singla
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;padding-top:5px;">
                Law Firm
              </div>
            </td>
          </tr>
        </table>
        <div style="height:2px;width:48px;background:${GOLD};margin-top:24px;"></div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};padding-top:18px;">
          ${escapeHtml(subtitle)}
        </div>
      </td>
    </tr>`;
}

function footer() {
  return `
    <tr>
      <td style="background:${INK};padding:28px 40px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:rgba(255,255,255,0.45);">
          This email was sent by ${escapeHtml(FIRM_NAME)}. It is confidential and intended only for
          the named recipient. If you have received it in error, please delete it and notify us.
          Nothing in this email constitutes legal advice or creates an advocate&ndash;client relationship.
        </div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);padding-top:14px;">
          <a href="${env.siteUrl}" style="color:${GOLD};text-decoration:none;">${escapeHtml(env.siteUrl.replace(/^https?:\/\//, ''))}</a>
        </div>
      </td>
    </tr>`;
}

function shell(inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(FIRM_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f0eb;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(FIRM_NAME)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f0eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;">
          ${inner}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** One label/value row in the enquiry detail table. */
function detailRow(label, value, { isLast = false, multiline = false } = {}) {
  const rendered = multiline ? escapeHtmlMultiline(value) : escapeHtml(value);

  return `
    <tr>
      <td style="padding:14px 0 14px 0;${isLast ? '' : `border-bottom:1px solid ${LINE};`}width:150px;vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};">
        ${escapeHtml(label)}
      </td>
      <td style="padding:14px 0;${isLast ? '' : `border-bottom:1px solid ${LINE};`}font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${INK};">
        ${rendered}
      </td>
    </tr>`;
}

/**
 * Notification sent to the firm.
 *
 * `replyTo` is set to the enquirer on the transport, so hitting Reply in Gmail
 * goes to the client rather than back to the firm's own mailbox.
 */
function buildNotificationEmail(enquiry) {
  const submittedAt = formatTimestamp(enquiry.createdAt || new Date());
  const phoneDigits = String(enquiry.phone).replace(/[^\d+]/g, '');

  const html = shell(`
    ${header('New website enquiry')}
    <tr>
      <td style="padding:36px 40px 8px 40px;">
        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${INK};font-weight:normal;">
          ${escapeHtml(enquiry.subject)}
        </h1>
        <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">
          Received ${escapeHtml(submittedAt)} IST
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 8px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRow('Name', enquiry.fullName)}
          ${detailRow('Email', enquiry.email)}
          ${detailRow('Phone', enquiry.phone)}
          ${detailRow('Practice area', enquiry.practiceArea)}
          ${detailRow('Message', enquiry.message, { isLast: true, multiline: true })}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 40px 40px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${GOLD};">
              <a href="mailto:${encodeURIComponent(enquiry.email)}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}"
                 style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${INK};text-decoration:none;">
                Reply by email
              </a>
            </td>
            <td style="width:12px;"></td>
            <td style="border:1px solid ${LINE};">
              <a href="tel:${escapeHtml(phoneDigits)}"
                 style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${INK};text-decoration:none;">
                Call client
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:22px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${MUTED};">
          The client has been sent an automatic acknowledgement promising a response within one
          working day.
        </p>
      </td>
    </tr>
    ${footer()}
  `);

  const text = [
    `NEW WEBSITE ENQUIRY — ${FIRM_NAME}`,
    '',
    `Subject:        ${enquiry.subject}`,
    `Received:       ${submittedAt} IST`,
    '',
    `Name:           ${enquiry.fullName}`,
    `Email:          ${enquiry.email}`,
    `Phone:          ${enquiry.phone}`,
    `Practice area:  ${enquiry.practiceArea}`,
    '',
    'Message:',
    enquiry.message,
    '',
    '---',
    'The client has been sent an automatic acknowledgement promising a response',
    'within one working day.',
  ].join('\n');

  return {
    subject: `New enquiry — ${enquiry.practiceArea}: ${enquiry.subject}`,
    html,
    text,
  };
}

/** Acknowledgement sent to the person who submitted the form. */
function buildAutoReplyEmail(enquiry) {
  const html = shell(`
    ${header('Enquiry received')}
    <tr>
      <td style="padding:36px 40px 0 40px;">
        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;color:${INK};font-weight:normal;">
          Thank you for contacting us
        </h1>
        <div style="height:2px;width:48px;background:${GOLD};margin-top:20px;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};">
        <p style="margin:0 0 16px 0;">Dear ${escapeHtml(enquiry.fullName)},</p>

        <p style="margin:0 0 16px 0;">
          We have received your enquiry regarding
          <strong style="color:${INK};">${escapeHtml(enquiry.practiceArea)}</strong>
          and it has been passed to the partner who practises in that area. You can expect a
          substantive response within <strong style="color:${INK};">one working day</strong>.
        </p>

        <p style="margin:0 0 16px 0;">
          Your enquiry is confidential from the moment it reached us. Please do not send sensitive
          documents by email until we confirm a secure route for them.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 40px 0 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf9f6;border-left:3px solid ${GOLD};">
          <tr>
            <td style="padding:22px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};padding-bottom:12px;">
                Your enquiry
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${INK};padding-bottom:10px;">
                ${escapeHtml(enquiry.subject)}
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:${MUTED};">
                ${escapeHtmlMultiline(enquiry.message)}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:${MUTED};">
        <p style="margin:0 0 16px 0;">
          <strong style="color:${INK};">If your matter is urgent</strong> — an arrest, a detention or
          an imminent search — please telephone the office rather than waiting for a reply to this
          email. That line reaches our criminal practice partner outside working hours.
        </p>
        <p style="margin:0;">
          Kind regards,<br>
          <strong style="color:${INK};">${escapeHtml(FIRM_NAME)}</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 40px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${INK};">
              <a href="${env.siteUrl}/practice-areas"
                 style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                Explore our practice areas
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footer()}
  `);

  const text = [
    `Dear ${enquiry.fullName},`,
    '',
    `Thank you for contacting ${FIRM_NAME}.`,
    '',
    `We have received your enquiry regarding ${enquiry.practiceArea} and it has been passed to the`,
    'partner who practises in that area. You can expect a substantive response within one working day.',
    '',
    'Your enquiry is confidential from the moment it reached us. Please do not send sensitive',
    'documents by email until we confirm a secure route for them.',
    '',
    'YOUR ENQUIRY',
    `Subject: ${enquiry.subject}`,
    '',
    enquiry.message,
    '',
    'If your matter is urgent — an arrest, a detention or an imminent search — please telephone',
    'the office rather than waiting for a reply to this email.',
    '',
    'Kind regards,',
    FIRM_NAME,
    env.siteUrl,
  ].join('\n');

  return {
    subject: `We have received your enquiry — ${FIRM_NAME}`,
    html,
    text,
  };
}

module.exports = { buildNotificationEmail, buildAutoReplyEmail };
