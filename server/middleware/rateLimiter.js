'use strict';

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Strict limit on enquiry submissions.
 *
 * Tuned to be generous for a real person (who submits once, occasionally twice
 * after a typo) and restrictive for a script. Keyed on IP, which is imperfect
 * behind shared NAT but is the only signal available without accounts.
 */
const contactLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many enquiries from this connection. Please wait a few minutes, or call the office directly.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`[rate-limit] Contact limit hit by ${req.ip}.`);
    res.status(options.statusCode).json(options.message);
  },
});

/** Broad ceiling on everything else, to blunt scraping and accidental loops. */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});

module.exports = { contactLimiter, generalLimiter };
