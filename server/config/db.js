'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 *
 * Resolves rather than throwing when no URI is configured, so the API can still
 * serve content endpoints and send enquiry emails without a database. Callers
 * check `isDatabaseReady()` before attempting a write.
 */
async function connectDatabase() {
  if (!env.isDatabaseConfigured) {
    logger.warn('[db] No MONGODB_URI configured; running without persistence.');
    return null;
  }

  if (isConnected) return mongoose.connection;

  // Fail fast on a bad URI instead of hanging the first request for 30 seconds.
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    isConnected = true;
    logger.info(`[db] Connected to MongoDB (${mongoose.connection.name}).`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('[db] Disconnected from MongoDB.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('[db] Reconnected to MongoDB.');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('[db] Connection error:', error.message);
    });

    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    logger.error('[db] Initial connection failed:', error.message);
    // Deliberately not rethrown: see the note above about degraded operation.
    return null;
  }
}

function isDatabaseReady() {
  return isConnected && mongoose.connection.readyState === 1;
}

async function disconnectDatabase() {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  logger.info('[db] Connection closed.');
}

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady };
