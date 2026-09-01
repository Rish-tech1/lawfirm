'use strict';

/**
 * Google reCAPTCHA v3 verification.
 *
 * Optional by design: with no secret configured every submission is treated as
 * "not assessed" and passes, leaving the honeypot, timing and rate-limit checks
 * to do the work. That keeps local development and a first deploy functional
 * before anyone provisions Google keys.
 */
const { env } = require('../config/env');
const logger = require('../utils/logger');

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * @returns {Promise<{ ok: boolean, score: number|null, reason: string|null }>}
 *   `ok: false` only when reCAPTCHA is configured AND actively rejected the
 *   token. A network failure resolves to `ok: true` — Google being unreachable
 *   should not block a genuine client from instructing a lawyer.
 */
async function verifyRecaptcha(token, remoteIp) {
  if (!env.isRecaptchaConfigured) {
    return { ok: true, score: null, reason: 'not-configured' };
  }

  if (!token) {
    return { ok: false, score: null, reason: 'missing-token' };
  }

  try {
    const body = new URLSearchParams({
      secret: env.recaptcha.secret,
      response: token,
    });

    if (remoteIp) body.append('remoteip', remoteIp);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn(`[recaptcha] Verify endpoint returned ${response.status}; allowing submission.`);
      return { ok: true, score: null, reason: 'verify-unavailable' };
    }

    const result = await response.json();

    if (!result.success) {
      const codes = (result['error-codes'] || []).join(', ') || 'unknown';
      logger.warn(`[recaptcha] Token rejected: ${codes}`);
      return { ok: false, score: null, reason: `rejected: ${codes}` };
    }

    const score = typeof result.score === 'number' ? result.score : null;

    if (score !== null && score < env.recaptcha.minScore) {
      logger.warn(`[recaptcha] Score ${score} below threshold ${env.recaptcha.minScore}.`);
      return { ok: false, score, reason: 'low-score' };
    }

    return { ok: true, score, reason: null };
  } catch (error) {
    // Timeout or network failure — fail open, as above.
    logger.warn('[recaptcha] Verification error; allowing submission:', error.message);
    return { ok: true, score: null, reason: 'verify-error' };
  }
}

module.exports = { verifyRecaptcha };
