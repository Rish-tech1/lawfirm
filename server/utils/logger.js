'use strict';

/**
 * Minimal levelled logger.
 *
 * Deliberately dependency-free: the API's logging needs are a timestamp and a
 * level, and a structured logging library would be more configuration than
 * value here. Swap in pino if log aggregation is added later.
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const configuredLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const threshold = LEVELS[configuredLevel] ?? LEVELS.info;

function emit(level, consoleMethod, args) {
  if (LEVELS[level] > threshold) return;
  const timestamp = new Date().toISOString();
  consoleMethod(`${timestamp} [${level.toUpperCase()}]`, ...args);
}

const logger = {
  error: (...args) => emit('error', console.error, args),
  warn: (...args) => emit('warn', console.warn, args),
  info: (...args) => emit('info', console.log, args),
  debug: (...args) => emit('debug', console.log, args),
};

module.exports = logger;
