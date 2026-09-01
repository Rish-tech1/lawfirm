'use strict';

const express = require('express');
const { submitEnquiry } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/** POST /api/contact — store the enquiry, notify the firm, acknowledge the client. */
router.post('/', contactLimiter, submitEnquiry);

module.exports = router;
