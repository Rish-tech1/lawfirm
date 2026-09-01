/**
 * Typed accessors over the JSON content files.
 *
 * The JSON is the editable source of truth (see README §"Editing content").
 * Casting once here means every consumer gets full type safety without each
 * component re-asserting the shape, and a bad edit fails `npm run typecheck`.
 *
 * All of this resolves at build time, so pages that use it stay static.
 */
import type {
  Faq,
  Feature,
  FirmContent,
  GalleryImage,
  Milestone,
  PracticeArea,
  Service,
  Stat,
  TeamMember,
  Testimonial,
} from '@/types';

import faqsData from './data/faqs.json';
import firmData from './data/firm.json';
import galleryData from './data/gallery.json';
import practiceAreasData from './data/practice-areas.json';
import servicesData from './data/services.json';
import statsData from './data/stats.json';
import teamData from './data/team.json';
import testimonialsData from './data/testimonials.json';
import timelineData from './data/timeline.json';
import whyChooseUsData from './data/why-choose-us.json';

export const practiceAreas = practiceAreasData as PracticeArea[];
export const services = servicesData as Service[];
export const team = teamData as TeamMember[];
export const testimonials = testimonialsData as Testimonial[];
export const faqs = faqsData as Faq[];
export const stats = statsData as Stat[];
export const whyChooseUs = whyChooseUsData as Feature[];
export const timeline = timelineData as Milestone[];
export const gallery = galleryData as GalleryImage[];
export const firm = firmData as FirmContent;

/* ---------------------------------------------------------------------------
 * Derived selections
 * ------------------------------------------------------------------------- */

export const featuredPracticeAreas = practiceAreas.filter((area) => area.featured);
export const featuredTeam = team.filter((member) => member.featured);
/** Enrolled advocates only — backs the hero's "Advocates" figure. */
export const advocates = team.filter((member) => member.isAdvocate);
export const featuredFaqs = faqs.filter((faq) => faq.featured);

export function getPracticeArea(slug: string): PracticeArea | undefined {
  return practiceAreas.find((area) => area.slug === slug);
}

export function getTeamMember(slug: string): TeamMember | undefined {
  return team.find((member) => member.slug === slug);
}

/** Options for the contact form's "Practice Area" select. */
export const practiceAreaOptions: string[] = [
  ...practiceAreas.map((area) => area.title),
  'Other / Not sure',
];

/** Unique FAQ categories in the order they first appear, for filter chips. */
export const faqCategories: Faq['category'][] = Array.from(
  new Set(faqs.map((faq) => faq.category)),
);

export {
  site,
  formattedAddress,
  offices,
  formatOfficeAddress,
  whatsappHref,
  mainNav,
  staticRoutes,
} from './site';
export type { NavItem, Office } from './site';
