'use strict';

/**
 * Read-only content store.
 *
 * The JSON files under `client/content/data` are the single source of truth for
 * site copy — the frontend imports them at build time, and this store reads the
 * same files so the API can never drift from what the site displays. There is
 * no CMS and no duplicated copy to keep in sync.
 *
 * Files are loaded once at boot and cached in memory: they are a few kilobytes,
 * they only change on deploy, and re-reading them per request would be pure
 * overhead. Restart the server (or redeploy) after editing content.
 */
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const CONTENT_DIR = path.resolve(__dirname, '..', '..', 'client', 'content', 'data');

const FILES = {
  practiceAreas: 'practice-areas.json',
  services: 'services.json',
  team: 'team.json',
  testimonials: 'testimonials.json',
  faqs: 'faqs.json',
  stats: 'stats.json',
  whyChooseUs: 'why-choose-us.json',
  timeline: 'timeline.json',
  gallery: 'gallery.json',
  firm: 'firm.json',
};

const cache = new Map();
let hasWarnedAboutDirectory = false;

function loadFile(key) {
  if (cache.has(key)) return cache.get(key);

  const filename = FILES[key];
  if (!filename) return null;

  const filePath = path.join(CONTENT_DIR, filename);

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    cache.set(key, parsed);
    return parsed;
  } catch (error) {
    // An absent content directory means the server was deployed without the
    // client workspace. Content endpoints degrade to empty; /api/contact is
    // unaffected, which is the endpoint that actually matters.
    if (!hasWarnedAboutDirectory) {
      logger.warn(
        `[content] Could not read ${filename} from ${CONTENT_DIR} (${error.code || error.message}). ` +
          'Content endpoints will return empty results. Deploy the repository root, not server/ alone.',
      );
      hasWarnedAboutDirectory = true;
    }
    cache.set(key, null);
    return null;
  }
}

/** Warms the cache and reports what is available, so problems show at boot. */
function preloadContent() {
  const loaded = [];
  const missing = [];

  for (const key of Object.keys(FILES)) {
    if (loadFile(key)) loaded.push(key);
    else missing.push(key);
  }

  if (loaded.length) logger.info(`[content] Loaded ${loaded.length} content files.`);
  if (missing.length) logger.warn(`[content] Missing: ${missing.join(', ')}.`);

  return { loaded, missing };
}

const getPracticeAreas = () => loadFile('practiceAreas') || [];
const getServices = () => loadFile('services') || [];
const getTeam = () => loadFile('team') || [];
const getTestimonials = () => loadFile('testimonials') || [];
const getFaqs = () => loadFile('faqs') || [];
const getStats = () => loadFile('stats') || [];
const getWhyChooseUs = () => loadFile('whyChooseUs') || [];
const getTimeline = () => loadFile('timeline') || [];
const getGallery = () => loadFile('gallery') || [];
const getFirm = () => loadFile('firm') || null;

/** Valid practice-area titles, used to sanity-check enquiry submissions. */
function getPracticeAreaTitles() {
  return getPracticeAreas().map((area) => area.title);
}

module.exports = {
  preloadContent,
  getPracticeAreas,
  getPracticeAreaTitles,
  getServices,
  getTeam,
  getTestimonials,
  getFaqs,
  getStats,
  getWhyChooseUs,
  getTimeline,
  getGallery,
  getFirm,
};
