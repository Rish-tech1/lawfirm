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

  /** Business hours drive both the visible list and the LocalBusiness schema. */
  hours: [
    { days: 'Monday – Friday', time: '9:30 AM – 7:00 PM', open: '09:30', close: '19:00', dayCodes: ['Mo', 'Tu', 'We', 'Th', 'Fr'] },
    { days: 'Saturday', time: '10:00 AM – 4:00 PM', open: '10:00', close: '16:00', dayCodes: ['Sa'] },
    { days: 'Sunday', time: 'Closed — urgent matters by phone', open: null, close: null, dayCodes: ['Su'] },
  ],

  /** LinkedIn is the firm's real profile. The rest are PLACEHOLDERS — replace or delete. */
  social: {
    linkedin: 'https://www.linkedin.com/company/singla-singla-law-firm/',
    facebook: 'https://www.facebook.com/example.singlalawfirm',
    twitter: 'https://twitter.com/example_singlalaw',
    instagram: 'https://www.instagram.com/example.singlalawfirm',
    /** Handle without the @, for Twitter card metadata. */
    twitterHandle: 'example_singlalaw',
  },

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

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Practice Areas', href: '/practice-areas' },
  { label: 'Team', href: '/team' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

/** Every indexable route, consumed by `app/sitemap.ts`. */
export const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'yearly' as const },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/practice-areas', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/team', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/testimonials', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.9, changeFrequency: 'yearly' as const },
];
