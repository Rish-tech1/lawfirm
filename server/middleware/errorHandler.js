'use strict';

const { ApiError } = require('../utils/ApiError');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/** 404 for unmatched routes — handed to the error handler below. */
function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
}

/**
 * Central error handler.
 *
 * Deliberate `ApiError`s are returned as-is. Anything else is logged in full
 * and reported as a generic 500, so stack traces and driver messages never
 * reach a client.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong on our end.';
  let errors = error.errors;

  /* --- Normalise known third-party error shapes ---------------------------- */

  // Mongoose schema validation (a bug on our side — the zod layer should catch
  // this first — but returned as a 422 so the client can still act on it).
  if (error.name === 'ValidationError' && error.errors) {
    statusCode = 422;
    message = 'Please correct the highlighted fields and try again.';
    errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]]),
    );
  }

  // Malformed ObjectId.
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'That identifier is not valid.';
  }

  // Unique index violation.
  if (error.code === 11000) {
    statusCode = 409;
    message = 'That record already exists.';
  }

  // Body-parser rejecting malformed JSON.
  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'The request body was not valid JSON.';
  }

  if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'The request body is too large.';
  }

  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error(`[error] ${req.method} ${req.originalUrl} —`, error.stack || error.message);
  } else {
    logger.warn(`[error] ${req.method} ${req.originalUrl} — ${statusCode}: ${message}`);
  }

  // Never surface internals for unexpected failures.
  if (isServerError && !(error instanceof ApiError)) {
    message = 'Something went wrong on our end. Please try again, or contact us by phone.';
    errors = undefined;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    // Stack traces in development only.
    ...(env.isProduction ? {} : { stack: error.stack }),
  });
}

module.exports = { errorHandler, notFoundHandler };
