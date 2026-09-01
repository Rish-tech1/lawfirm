'use strict';

/**
 * Operational error carrying an HTTP status.
 *
 * `isOperational` distinguishes errors we raised deliberately (safe to show the
 * client) from unexpected crashes (which must be logged and reported as a
 * generic 500, so internals never leak into a response).
 */
class ApiError extends Error {
  constructor(statusCode, message, { errors, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = true;
    /** Field-level validation errors, keyed by field name. */
    this.errors = errors;
    if (cause) this.cause = cause;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, { errors });
  }

  static validation(message, errors) {
    return new ApiError(422, message, { errors });
  }

  static tooManyRequests(message) {
    return new ApiError(429, message);
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }

  static internal(message = 'Something went wrong on our end.', cause) {
    return new ApiError(500, message, { cause });
  }
}

/** Wraps an async route handler so rejections reach the error middleware. */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = { ApiError, asyncHandler };
