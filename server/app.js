'use strict';

/**
 * Express application.
 *
 * Kept separate from `server.js` (which owns the listener and the database
 * connection) so the app can be imported by tests without opening a port.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const app = express();

/**
 * Render, Railway and most PaaS hosts terminate TLS at a proxy, so the client
 * IP arrives in X-Forwarded-For. Without this, rate limiting and the abuse log
 * would see every request as coming from the proxy.
 *
 * `1` (not `true`) trusts exactly one hop — a blanket `true` would let a client
 * spoof its own IP by sending the header itself.
 */
app.set('trust proxy', 1);
app.disable('x-powered-by');

/* --- Security ------------------------------------------------------------- */

app.use(
  helmet({
    // This is a JSON API; it serves no HTML, so a page CSP is not applicable.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);

/**
 * CORS.
 *
 * An explicit allowlist rather than a wildcard: `POST /api/contact` writes to
 * the database and sends mail, so it should only be callable from our own
 * frontends. Requests with no Origin (curl, health checks, server-to-server)
 * are allowed, since CORS is a browser-enforced policy and blocking them would
 * only break monitoring.
 */
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (env.allowedOrigins.includes(origin)) return callback(null, true);

    // Any *.vercel.app preview deployment of this project.
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) && !env.isProduction) {
      return callback(null, true);
    }

    logger.warn(`[cors] Blocked origin: ${origin}`);
    return callback(new Error('This origin is not permitted by CORS policy.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
  maxAge: 86400,
};

app.use(cors(corsOptions));

/* --- Parsing & performance ------------------------------------------------ */

/**
 * JSON only — deliberately no `express.urlencoded`.
 *
 * A form-encoded cross-origin POST is a CORS "simple request": the browser
 * sends it with no preflight, and CORS only stops the attacker from READING
 * the response. With a urlencoded parser mounted, any page on the web could
 * silently drive `POST /api/contact` — writing an enquiry and triggering mail —
 * and never need to see the reply. Accepting only `application/json` forces a
 * preflight, which the CORS allowlist above then actually enforces.
 *
 * 64kb is comfortably above the largest legitimate enquiry (a 4000-character
 * message) and well below anything worth using as a memory-exhaustion vector.
 */
app.use(express.json({ limit: '64kb' }));
app.use(compression());

/* --- Logging -------------------------------------------------------------- */

app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) },
    // Health checks would otherwise dominate the logs.
    skip: (req) => req.path === '/api/health' && env.isProduction,
  }),
);

/* --- Routes --------------------------------------------------------------- */

app.use('/api', generalLimiter, routes);

/** Root gives a human a pointer rather than a 404. */
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Singla & Singla Law Firm API',
    data: {
      health: '/api/health',
      endpoints: [
        'POST /api/contact',
        'GET  /api/practice-areas',
        'GET  /api/practice-areas/:slug',
        'GET  /api/services',
        'GET  /api/team',
        'GET  /api/team/:slug',
        'GET  /api/testimonials',
        'GET  /api/faqs',
        'GET  /api/content',
      ],
    },
  });
});

/* --- Errors --------------------------------------------------------------- */

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
