'use strict';

const express = require('express');
const mongoose = require('mongoose');
const contactRoutes = require('./contact.routes');
const contentRoutes = require('./content.routes');
const { env } = require('../config/env');
const { isUsingFallbackTransport } = require('../services/mailer');

const router = express.Router();

/**
 * GET /api/health
 *
 * Reports which subsystems are actually usable rather than a bare "ok", so a
 * deploy with a bad Mongo URI or app password is visible immediately. Always
 * returns 200 — the process is up; the body describes how well.
 */
router.get('/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];

  res.json({
    success: true,
    message: 'API is running.',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.nodeEnv,
      database: env.isDatabaseConfigured ? dbState : 'not-configured',
      mail: isUsingFallbackTransport()
        ? 'dev-fallback (Ethereal — captured, not delivered)'
        : env.isMailConfigured
          ? 'configured'
          : 'not-configured',
      recaptcha: env.isRecaptchaConfigured ? 'configured' : 'not-configured',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/contact', contactRoutes);
router.use('/', contentRoutes);

module.exports = router;
