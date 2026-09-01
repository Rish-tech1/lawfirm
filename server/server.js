'use strict';

/**
 * Entry point: boots dependencies, then starts listening.
 *
 * Content and the mail transport are prepared before the port opens so that a
 * misconfiguration appears in the deploy log rather than as a failed enquiry.
 */
const app = require('./app');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const { preloadContent } = require('./services/contentStore');
const { verifyMailer } = require('./services/mailer');
const { env, validateEnv } = require('./config/env');
const logger = require('./utils/logger');

let server = null;
let isShuttingDown = false;

async function start() {
  logger.info(`[boot] Starting API in ${env.nodeEnv} mode…`);

  validateEnv(logger);
  preloadContent();

  // Neither is fatal: the API degrades rather than refusing to serve. See the
  // note in config/env.js about why an enquiry we can partly handle beats one
  // we reject outright.
  await Promise.allSettled([connectDatabase(), verifyMailer()]);

  server = app.listen(env.port, () => {
    logger.info(`[boot] Listening on http://localhost:${env.port}`);
    logger.info(`[boot] Health check at http://localhost:${env.port}/api/health`);
    logger.info(`[boot] CORS allowlist: ${env.allowedOrigins.join(', ') || '(none)'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`[boot] Port ${env.port} is already in use.`);
      process.exit(1);
    }
    throw error;
  });
}

/**
 * Graceful shutdown: stop accepting connections, let in-flight requests finish,
 * then close the database. Without this, a deploy can cut off a request that has
 * already taken an enquiry but not yet emailed it.
 */
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`[shutdown] ${signal} received; closing gracefully…`);

  const forceExit = setTimeout(() => {
    logger.error('[shutdown] Did not close in 10s; forcing exit.');
    process.exit(1);
  }, 10_000);
  // Do not let this timer hold the process open on a clean shutdown.
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      logger.info('[shutdown] HTTP server closed.');
    }

    await disconnectDatabase();
    clearTimeout(forceExit);
    logger.info('[shutdown] Done.');
    process.exit(0);
  } catch (error) {
    logger.error('[shutdown] Error while closing:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * An unhandled rejection or uncaught exception leaves the process in an unknown
 * state; log it and exit so the platform restarts a clean one.
 */
process.on('unhandledRejection', (reason) => {
  logger.error('[fatal] Unhandled promise rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('[fatal] Uncaught exception:', error.stack || error.message);
  shutdown('uncaughtException');
});

start().catch((error) => {
  logger.error('[boot] Failed to start:', error.stack || error.message);
  process.exit(1);
});
