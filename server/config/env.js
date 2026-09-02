'use strict';

/**
 * Environment configuration.
 *
 * Loaded and validated once at boot so a missing variable surfaces immediately
 * with a clear message, rather than as a confusing failure on the first request.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Comma-separated list -> trimmed array, empty entries dropped. */
function parseList(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGODB_URI || '',

  /**
   * Origins permitted by CORS. `ALLOWED_ORIGINS` overrides this list entirely,
   * so set it on the host whenever the deployed frontend URLs change.
   *
   * The production domains are in the default rather than left to the env var
   * alone because `server/.env` is gitignored and never reaches the deploy
   * host: if the var is missing there, the fallback is what actually serves
   * traffic, and a localhost-only fallback rejects every real browser request
   * with a preflight that carries no Access-Control-Allow-Origin.
   */
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS, [
    'https://www.singlalawfirm.in',
    'https://singlalawfirm.in',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]),

  /**
   * SMTP transport — provider-agnostic.
   *
   * `SMTP_USER`/`SMTP_PASS` are the canonical names; `GMAIL_USER`/
   * `GMAIL_APP_PASSWORD` are still honoured so existing Gmail deployments keep
   * working without an env change.
   *
   * `fromAddress` is deliberately separate from `user`. With Gmail the two are
   * the same address — Gmail rewrites or rejects any other sender. The split
   * exists because some relays issue a login that is not a mailbox, where
   * sending *from* the login would fail or land in spam; those need the visible
   * sender configured independently and verified with the provider.
   */
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : (Number(process.env.SMTP_PORT || 587) === 465),
    user: process.env.SMTP_USER || process.env.GMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '',
    fromName: process.env.MAIL_FROM_NAME || 'Singla & Singla Law Firm',
    fromAddress:
      process.env.MAIL_FROM_ADDRESS || process.env.GMAIL_USER || process.env.SMTP_USER || '',
  },

  /** Mailbox that receives enquiry notifications. */
  enquiryRecipient:
    process.env.ENQUIRY_RECIPIENT || process.env.MAIL_FROM_ADDRESS || process.env.GMAIL_USER || '',

  recaptcha: {
    secret: process.env.RECAPTCHA_SECRET_KEY || '',
    /** v3 scores range 0–1; below this is treated as automated. */
    minScore: Number(process.env.RECAPTCHA_MIN_SCORE) || 0.5,
  },

  /** Public site URL, used in email templates. */
  siteUrl: (process.env.SITE_URL || 'https://www.singlalawfirm.com').replace(/\/$/, ''),

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 5,
  },
};

env.isProduction = env.nodeEnv === 'production';
env.isMailConfigured = Boolean(
  env.smtp.user && env.smtp.pass && env.smtp.fromAddress && env.enquiryRecipient,
);
env.isDatabaseConfigured = Boolean(env.mongoUri);
env.isRecaptchaConfigured = Boolean(env.recaptcha.secret);

/**
 * Warn loudly but do not exit on missing optional config.
 *
 * The API stays useful in degraded form — an enquiry that can be stored but not
 * emailed is far better than a server that refuses to boot, because the
 * enquiry is not lost. Anything genuinely required in production is fatal.
 */
function validateEnv(logger = console) {
  const warnings = [];

  if (!env.isDatabaseConfigured) {
    warnings.push('MONGODB_URI is not set — enquiries will not be persisted.');
  }

  if (!env.isMailConfigured) {
    const missing = [
      !env.smtp.user && 'SMTP_USER',
      !env.smtp.pass && 'SMTP_PASS',
      !env.smtp.fromAddress && 'MAIL_FROM_ADDRESS',
      !env.enquiryRecipient && 'ENQUIRY_RECIPIENT',
    ].filter(Boolean);

    warnings.push(
      `Mail transport incomplete (missing: ${missing.join(', ')}) — enquiry emails will not be sent.`,
    );
  }

  if (!env.isRecaptchaConfigured) {
    warnings.push(
      'RECAPTCHA_SECRET_KEY is not set — relying on honeypot, timing and rate-limit checks only.',
    );
  }

  for (const warning of warnings) {
    logger.warn(`[config] ${warning}`);
  }

  if (env.isProduction && !env.isDatabaseConfigured && !env.isMailConfigured) {
    logger.error(
      '[config] Refusing to start in production with neither a database nor mail transport: ' +
        'enquiries would be accepted and silently discarded.',
    );
    process.exit(1);
  }

  return warnings;
}

module.exports = { env, validateEnv };
