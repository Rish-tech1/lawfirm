
/**
 * Single source of truth for firm identity, contact details and navigation.
 *
 * ⚠️  REPLACE THE PLACEHOLDER VALUES BELOW WITH THE FIRM'S REAL DETAILS.
 * Everything marked `PLACEHOLDER` is invented and appears in visible copy,
 * structured data, sitemap URLs and email templates. See README §"Placeholders".
 */

/**
 * Reads an env var, treating blank as unset.
 *
 * `??` only catches null/undefined, so a declared-but-empty variable (very
 * common — `NEXT_PUBLIC_FOO=` in a .env file) slips through as `''` and
 * silently overrides the fallback. That produced an `<iframe src="">` on the
 * contact page, which makes the browser re-request the whole document.
 */
function envOr<T extends string | null>(value: string | undefined, fallback: T): string | T {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

const siteUrl = envOr(process.env.NEXT_PUBLIC_SITE_URL, 'https://www.singlalawfirm.com').replace(
  /\/$/,
  '',
);

/** Digits only, with country code — required by the wa.me link format. */
const whatsappNumber = envOr(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, '919811135465');

/**
 * Off-site profiles, emitted as `sameAs` in the organisation schema.
 *
 * `null` means the firm has no such account, and every consumer filters those
 * out. This is typed rather than inlined so a missing profile is a deliberate
 * `null` and not an invented URL.
 *
 * These are not decorative. `sameAs` is how Google ties this website to the
 * firm's other profiles when resolving it to a single Knowledge Graph entity,
 * and it fetches every URL it is handed. Three invented `example.*` addresses
 * used to sit here, so the one signal whose job is to consolidate the firm's
 * identity was pointing at pages that do not exist. Add a real URL only once
 * the profile is live.
 */
interface SocialProfiles {
  linkedin: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  /** Handle without the `@`, for Twitter card metadata. */
  twitterHandle: string | null;
}

const social: SocialProfiles = {
  linkedin: 'https://www.linkedin.com/company/singla-singla-law-firm/',
  facebook: null,
  twitter: null,
  instagram: null,
  twitterHandle: null,
};

/**
 * Date the site's copy was last reviewed, in `YYYY-MM-DD`.
 *
 * This is the sitemap's fallback `lastmod`. It is a hand-maintained constant
 * rather than `new Date()` because a build timestamp tells search engines that
 * every page changed every time anything shipped — including deploys that only
 * touched CSS. A crawler that is told the whole site changed weekly, and then
 * finds identical content, learns to discount the signal entirely.
 *
 * Bump this when you revise copy broadly; for a single page, set `updated` on
 * that route or practice area instead and leave this alone.
 */
export const CONTENT_LAST_REVIEWED = '2026-09-05';

export const site = {
  name: 'Singla & Singla Law Firm',
  shortName: 'Singla & Singla',
  legalName: 'Singla & Singla Law Firm',
  /** Monogram used by the logo mark. */
  monogram: 'S&S',
  tagline: 'Justice. Integrity. Excellence.',
  /** Taken from the firm's logo artwork, which reads "EST. 1997". */
  foundingYear: 1997,

  description:
    'Singla & Singla Law Firm is a full-service legal practice advising individuals, families and businesses across corporate, civil, criminal, family, property and taxation law. Book a confidential consultation.',

  url: siteUrl,

  phone: {
    primary: '+91 98111 35465',
    secondary: '+91 93111 35465',
    /** tel: href form — digits, no spaces. */
    primaryHref: '+919811135465',
    secondaryHref: '+919311135465',
  },

  /**
   * The firm currently runs a single mailbox, so `consultation` points at the
   * same address. Give it its own value if a dedicated one is added — the
   * contact block already renders the second line only when the two differ.
   */
  email: {
    general: 'naveensinglaadv1@gmail.com',
    consultation: 'naveensinglaadv1@gmail.com',
  },

  whatsapp: {
    number: whatsappNumber,
    message: 'Hello, I would like to book a consultation with Singla & Singla Law Firm.',
  },

  /**
   * The principal chamber. Branch chambers live in `offices` below — this entry
   * is the one that backs the footer, the page metadata and the
   * LocalBusiness/PostalAddress schema, which take a single address.
   */
  address: {
    line1: 'Chamber No. F-622, F Block Lawyer’s Chamber',
    line2: '6th Floor, Karkardooma Court',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110032',
    country: 'India',
    countryCode: 'IN',
  },

  /**
   * Approximate coordinates for the Karkardooma court complex — close enough to
   * drop the marker on the right block. Replace with the exact pin from Google
   * Maps if the map needs to land on the building entrance.
   */
  geo: {
    latitude: 28.6519,
    longitude: 77.3003,
  },

  /**
   * Every city the firm accepts instructions in, principal seat first.
   *
   * Feeds `areaServed` on the organisation and per-practice-area schema, and
   * the geographic terms in page keywords. The chambers are in East Delhi but
   * the practice runs across the National Capital Region, and the schema
   * previously claimed `Delhi` alone — the narrower of the two truths, and the
   * one that keeps the firm out of results for the rest of the NCR.
   *
   * Only list a city the firm will genuinely take work in. `areaServed` is a
   * claim about the business, and a list padded with places it does not
   * practise is the kind of thing that gets a Business Profile suspended.
   */
  areaServed: [
    'Delhi',
    'New Delhi',
    'Noida',
    'Greater Noida',
    'Ghaziabad',
    'Gurugram',
    'Faridabad',
  ],

  /** Business hours drive both the visible list and the LocalBusiness schema. */
  hours: [
    { days: 'Monday – Friday', time: '9:30 AM – 7:00 PM', open: '09:30', close: '19:00', dayCodes: ['Mo', 'Tu', 'We', 'Th', 'Fr'] },
    { days: 'Saturday', time: '10:00 AM – 4:00 PM', open: '10:00', close: '16:00', dayCodes: ['Sa'] },
    { days: 'Sunday', time: 'Closed — urgent matters by phone', open: null, close: null, dayCodes: ['Su'] },
  ],

  /** See the `SocialProfiles` note above. Only live profiles belong here. */
  social,

  /**
   * Google Maps: `embedQuery` builds a keyless iframe embed, `directionsUrl`
   * opens turn-by-turn directions. Set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL to
   * use a Maps Embed API URL with your own key instead.
   */
  map: {
    embedQuery: 'Karkardooma Court Complex, Delhi, 110032, India',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Karkardooma+Court+Complex%2C+Delhi%2C+110032%2C+India',
    embedUrl: envOr(process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL, null),
  },

  /** Bar Council registration shown in the footer disclaimer. */
  registration: 'Bar Council of Delhi-NCR',
} as const;

/** `Chamber No. F-622, F Block Lawyer’s Chamber, 6th Floor, Karkardooma Court, Delhi 110032, India` */
export const formattedAddress = [
  site.address.line1,
  site.address.line2,
  `${site.address.city} ${site.address.postalCode}`,
  site.address.country,
].join(', ');

export interface Office {
  id: string;
  /** Short label for the map switcher and the contact list. */
  name: string;
  role: string;
  /** Street lines, in display order. City and PIN are appended by `formatOfficeAddress`. */
  lines: string[];
  city: string;
  postalCode: string;
  /** Feeds the keyless `output=embed` iframe on the contact page. */
  embedQuery: string;
  /** "Get Directions" target — opens the pin in Google Maps. */
  mapUrl: string;
}

/**
 * Every chamber the firm sits at. The first entry is the principal office and
 * must mirror `site.address`, which is what the footer and structured data use;
 * the rest are branch chambers and appear only where all three are listed.
 */
export const offices: Office[] = [
  {
    id: 'karkardooma',
    name: 'Karkardooma Court',
    role: 'Principal Office',
    lines: [site.address.line1, site.address.line2],
    city: site.address.city,
    postalCode: site.address.postalCode,
    embedQuery: site.map.embedQuery,
    mapUrl: site.map.directionsUrl,
  },
  {
    id: 'trilokpuri',
    name: 'Trilokpuri',
    role: 'Branch Chamber',
    lines: ['Shop No. 12, Block 6–7', 'Trilokpuri'],
    city: 'Delhi',
    postalCode: '110091',
    embedQuery: 'Block 6, Trilokpuri, Delhi, 110091, India',
    mapUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Block+6%2C+Trilokpuri%2C+Delhi%2C+110091%2C+India',
  },
  {
    id: 'mayur-vihar',
    name: 'Mayur Vihar Phase 1',
    role: 'Branch Chamber',
    lines: ['A2/80 (544-B), 3rd Floor, Shiv Arcade', 'Acharya Niketan, Mayur Vihar Phase 1'],
    city: 'Delhi',
    postalCode: '110091',
    /* Query taken from the firm's own Google Maps pin (maps.app.goo.gl/HNg6i9b4HUpVRkiq5),
       resolved to its long form — short links do not render inside an iframe. */
    embedQuery: 'Shiv Arcade, Block D, Acharya Niketan, Mayur Vihar, Delhi, 110091',
    mapUrl: 'https://maps.app.goo.gl/HNg6i9b4HUpVRkiq5',
  },
];

/** `Shop No. 12, Block 6–7, Trilokpuri, Delhi 110091` */
export function formatOfficeAddress(office: Office): string {
  return [...office.lines, `${office.city} ${office.postalCode}`].join(', ');
}

export const whatsappHref = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(
  site.whatsapp.message,
)}`;

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Whether the testimonials page and the home-page slider are built at all.
 *
 * Defaults to **on**, so nothing changes until someone opts out. Set
 * `NEXT_PUBLIC_SHOW_TESTIMONIALS=false` to drop the route, its navigation
 * entry, its sitemap entry, the home-page slider and the `Review` structured
 * data in one move.
 *
 * The switch exists because `testimonials.json` currently holds invented
 * clients. That is two separate problems: Bar Council of India Rule 36
 * restricts advocate testimonials (README §"Regulatory note"), and fabricated
 * client accounts on an indexed page are exactly the first-hand-experience
 * signal Google's quality guidance treats as a trust failure. Whether to
 * publish them is the firm's decision, not a code decision — so this is a flag
 * rather than a deletion.
 */
export const showTestimonials = process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS !== 'false';

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Practice Areas', href: '/practice-areas' },
  { label: 'Team', href: '/team' },
  ...(showTestimonials ? [{ label: 'Testimonials', href: '/testimonials' }] : []),
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /**
   * ISO date (`YYYY-MM-DD`) this page's copy was last revised. Omit and the
   * route falls back to `CONTENT_LAST_REVIEWED`.
   */
  updated?: string;
}

/** Every indexable route, consumed by `app/sitemap.ts`. */
export const staticRoutes: StaticRoute[] = [
  { path: '/', priority: 1.0, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/practice-areas', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.7, changeFrequency: 'yearly' },
  ...(showTestimonials
    ? [{ path: '/testimonials', priority: 0.6, changeFrequency: 'monthly' as const }]
    : []),
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.9, changeFrequency: 'yearly' },
];
