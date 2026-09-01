'use strict';

const express = require('express');
const controller = require('../controllers/contentController');

const router = express.Router();

/* Collections */
router.get('/practice-areas', controller.getPracticeAreas);
router.get('/services', controller.getServices);
router.get('/team', controller.getTeam);
router.get('/testimonials', controller.getTestimonials);
router.get('/faqs', controller.getFaqs);

/* Everything at once, for a single-round-trip client */
router.get('/content', controller.getSiteContent);

/**
 * Single items — registered after the collections so `/practice-areas/:slug`
 * cannot shadow `/practice-areas`.
 */
router.get('/practice-areas/:slug', controller.getPracticeAreaBySlug);
router.get('/team/:slug', controller.getTeamMemberBySlug);

module.exports = router;
