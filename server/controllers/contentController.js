'use strict';

const store = require('../services/contentStore');
const { ApiError, asyncHandler } = require('../utils/ApiError');

/**
 * Content endpoints.
 *
 * These exist so the content is consumable by other clients (a future mobile
 * app, an internal dashboard, a partner integration). The website itself does
 * NOT call them: it imports the same JSON at build time, which keeps every page
 * statically rendered and independent of this API's availability. See README
 * §"Why the site does not fetch its content".
 */

/** Long cache: content only changes when the repository is redeployed. */
function withCache(res) {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  return res;
}

function ok(res, data) {
  return withCache(res).json({
    success: true,
    message: 'OK',
    count: Array.isArray(data) ? data.length : undefined,
    data,
  });
}

const getPracticeAreas = asyncHandler(async (req, res) => {
  const areas = store.getPracticeAreas();

  // ?featured=true returns only the areas surfaced on the home-page grid.
  if (req.query.featured === 'true') {
    return ok(res, areas.filter((area) => area.featured));
  }

  return ok(res, areas);
});

const getPracticeAreaBySlug = asyncHandler(async (req, res) => {
  const area = store.getPracticeAreas().find((item) => item.slug === req.params.slug);

  if (!area) {
    throw ApiError.notFound(`No practice area found with slug "${req.params.slug}".`);
  }

  return ok(res, area);
});

const getServices = asyncHandler(async (_req, res) => ok(res, store.getServices()));

const getTeam = asyncHandler(async (_req, res) => ok(res, store.getTeam()));

const getTeamMemberBySlug = asyncHandler(async (req, res) => {
  const member = store.getTeam().find((item) => item.slug === req.params.slug);

  if (!member) {
    throw ApiError.notFound(`No team member found with slug "${req.params.slug}".`);
  }

  return ok(res, member);
});

const getTestimonials = asyncHandler(async (req, res) => {
  let testimonials = store.getTestimonials();

  // ?practiceArea=Family%20Law
  if (req.query.practiceArea) {
    const filter = String(req.query.practiceArea).toLowerCase();
    testimonials = testimonials.filter((item) => item.practiceArea.toLowerCase() === filter);
  }

  return ok(res, testimonials);
});

const getFaqs = asyncHandler(async (req, res) => {
  let faqs = store.getFaqs();

  if (req.query.category) {
    const filter = String(req.query.category).toLowerCase();
    faqs = faqs.filter((item) => item.category.toLowerCase() === filter);
  }

  if (req.query.featured === 'true') {
    faqs = faqs.filter((item) => item.featured);
  }

  return ok(res, faqs);
});

/** Everything the home page needs, in one round trip. */
const getSiteContent = asyncHandler(async (_req, res) =>
  ok(res, {
    firm: store.getFirm(),
    stats: store.getStats(),
    whyChooseUs: store.getWhyChooseUs(),
    timeline: store.getTimeline(),
    gallery: store.getGallery(),
    practiceAreas: store.getPracticeAreas(),
    services: store.getServices(),
    team: store.getTeam(),
    testimonials: store.getTestimonials(),
    faqs: store.getFaqs(),
  }),
);

module.exports = {
  getPracticeAreas,
  getPracticeAreaBySlug,
  getServices,
  getTeam,
  getTeamMemberBySlug,
  getTestimonials,
  getFaqs,
  getSiteContent,
};
