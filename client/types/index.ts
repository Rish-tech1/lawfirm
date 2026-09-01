/**
 * Shared content and form types.
 *
 * The JSON files in `content/data` are the single source of truth for all
 * site copy; these interfaces describe their shape so the compiler catches a
 * typo in the data as readily as one in a component.
 */

/** Key into the icon registry in `components/ui/Icon.tsx`. */
export type IconName =
  | 'scale'
  | 'gavel'
  | 'shield'
  | 'building'
  | 'family'
  | 'heartBroken'
  | 'home'
  | 'briefcase'
  | 'cart'
  | 'hardHat'
  | 'cheque'
  | 'handshake'
  | 'monitor'
  | 'lightbulb'
  | 'receipt'
  | 'bank'
  | 'key'
  | 'clock'
  | 'lock'
  | 'chat'
  | 'award'
  | 'users'
  | 'check'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'document'
  | 'search'
  | 'target';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface PracticeArea {
  slug: string;
  title: string;
  /** One-line summary used on preview cards. */
  tagline: string;
  icon: IconName;
  /** Shown on the home-page and practice-areas grid. */
  featured: boolean;
  /** Two or three paragraphs of long-form introduction. */
  overview: string[];
  servicesOffered: string[];
  process: ProcessStep[];
  benefits: string[];
  /** Feeds the per-area page meta description and keywords. */
  metaDescription: string;
  keywords: string[];
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  image: string;
  imageAlt: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface TeamMember {
  slug: string;
  /**
   * Rendered verbatim on the card. Carries the "Advocate" prefix only where the
   * member is enrolled — the prefix is part of the name here, not a title.
   */
  name: string;
  designation: string;
  qualification: string;
  experience: string;
  /** Years as a number, for sorting and schema output. */
  experienceYears: number;
  expertise: string[];
  /**
   * Contact details are optional: they feed the Attorney structured data and
   * nothing visible, so a member whose details we don't have omits them rather
   * than carrying a placeholder into search results.
   */
  email?: string;
  phone?: string;
  linkedin?: string;
  bio: string[];
  image: string;
  imageAlt: string;
  /**
   * CSS object-position for the card crop. Defaults to `top`, which suits
   * portraits framed tight to the head. Override per photo where the subject
   * sits lower in the frame — see the note in components/cards/TeamCard.tsx.
   */
  imagePosition?: string;
  featured: boolean;
  /**
   * Whether this member is an enrolled advocate. Drives the "Advocates" count in
   * the hero, so team members who are not advocates do not inflate it. Enrolled
   * members also carry the "Advocate" prefix in `name`.
   */
  isAdvocate: boolean;
  /** Rendered under the name on the team card. Omit where the number is not known. */
  barCouncilId?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  /** e.g. "Managing Director, Aurora Textiles" or "Family Law Client". */
  role: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  practiceArea: string;
  /** Longer narrative rendered on the testimonials page only. */
  successStory?: string;
  initials: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'Consultation' | 'Fees' | 'Process' | 'Documents' | 'General';
  /** Surfaced in the home-page FAQ preview. */
  featured: boolean;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: IconName;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface Milestone {
  /** A single year or a span, e.g. `2010–2015`. Rendered as the node label. */
  year: string;
  title: string;
  /** Court, chamber or strapline shown under the title. Omit where there isn't one. */
  subtitle?: string;
  /** One or more paragraphs. The last one may lead into `highlights`. */
  description: string[];
  /** Practice areas or courts, rendered as tags after the description. */
  highlights?: string[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

export interface FirmContent {
  introduction: string[];
  history: string[];
  mission: string;
  vision: string;
  trustReasons: Feature[];
  founder: {
    name: string;
    designation: string;
    image: string;
    imageAlt: string;
    message: string[];
  };
}

/** Payload posted to `POST /api/contact`. */
export interface ContactPayload {
  fullName: string;
  email: string;
  phone: string;
  practiceArea: string;
  subject: string;
  message: string;
  consent: boolean;
  /** Honeypot — must stay empty. Bots that fill it are silently dropped. */
  website?: string;
  /** Milliseconds the form was on screen before submit; blocks instant bots. */
  elapsedMs?: number;
  recaptchaToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
