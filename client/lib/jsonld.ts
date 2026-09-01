/**
 * JSON-LD structured data builders.
 *
 * Each function returns a plain object that `<JsonLd>` serialises into a
 * `<script type="application/ld+json">` tag. Keeping them here (rather than
 * inline in pages) means the firm's identity data is asserted once and reused,
 * so Google never sees two different addresses for the same organisation.
 *
 * Validate output with https://search.google.com/test/rich-results
 */
import { site } from '@/content/site';
import type { Faq, PracticeArea, TeamMember, Testimonial } from '@/types';
import { absoluteUrl } from './utils';

type JsonLdObject = Record<string, unknown>;

const DAY_NAMES: Record<string, string> = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

/** Stable @id values let separate nodes reference one canonical entity. */
export const ORGANISATION_ID = `${site.url}/#organisation`;
export const WEBSITE_ID = `${site.url}/#website`;

function postalAddress(): JsonLdObject {
  return {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: site.address.countryCode,
  };
}

function openingHours(): JsonLdObject[] {
  return site.hours
    .filter((slot) => slot.open && slot.close)
    .map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.dayCodes.map((code) => DAY_NAMES[code]).filter(Boolean),
      opens: slot.open,
      closes: slot.close,
    }));
}

/**
 * The firm itself, typed as both LegalService and LocalBusiness so it is
 * eligible for local-pack results as well as service-level rich results.
 */
export function organisationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': ['LegalService', 'LocalBusiness'],
    '@id': ORGANISATION_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.shortName,
    description: site.description,
    url: site.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo-lockup.png', site.url),
      width: 1631,
      height: 455,
    },
    image: absoluteUrl('/opengraph-image', site.url),
    telephone: site.phone.primaryHref,
    email: site.email.general,
    foundingDate: String(site.foundingYear),
    address: postalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: site.map.directionsUrl,
    openingHoursSpecification: openingHours(),
    /** Consultation is fee-based and quoted per matter; ₹₹ signals mid-market. */
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    areaServed: [
      { '@type': 'City', name: site.address.city },
      { '@type': 'State', name: site.address.state },
      { '@type': 'Country', name: site.address.country },
    ],
    knowsLanguage: ['en', 'hi', 'pa'],
    sameAs: Object.values({
      linkedin: site.social.linkedin,
      facebook: site.social.facebook,
      twitter: site.social.twitter,
      instagram: site.social.instagram,
    }).filter(Boolean),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Client enquiries',
        telephone: site.phone.primaryHref,
        email: site.email.general,
        areaServed: site.address.countryCode,
        availableLanguage: ['English', 'Hindi', 'Punjabi'],
      },
    ],
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANISATION_ID },
  };
}

/** Catalogue of practice areas, linked to the organisation node. */
export function serviceCatalogueSchema(areas: PracticeArea[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `Legal services — ${site.name}`,
    url: absoluteUrl('/practice-areas', site.url),
    provider: { '@id': ORGANISATION_ID },
    itemListElement: areas.map((area, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'Service',
        name: area.title,
        description: area.tagline,
        url: absoluteUrl(`/practice-areas/${area.slug}`, site.url),
        serviceType: area.title,
        provider: { '@id': ORGANISATION_ID },
      },
    })),
  };
}

/** Per-practice-area detail page. */
export function practiceAreaSchema(area: PracticeArea): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: `${area.title} — ${site.name}`,
    description: area.metaDescription,
    url: absoluteUrl(`/practice-areas/${area.slug}`, site.url),
    serviceType: area.title,
    provider: { '@id': ORGANISATION_ID },
    areaServed: { '@type': 'State', name: site.address.state },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${area.title} services`,
      itemListElement: area.servicesOffered.map((item, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: { '@type': 'Service', name: item },
      })),
    },
  };
}

/**
 * Empty fields are omitted rather than emitted blank: `JSON.stringify` drops
 * `undefined` properties, so a member with no recorded email or qualification
 * simply has no such key in the graph. An `"email": ""` would be worse than
 * silence — it is a claim, and a false one.
 */
export function attorneySchema(member: TeamMember): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Attorney',
    name: member.name,
    jobTitle: member.designation || undefined,
    description: member.bio[0],
    image: absoluteUrl(member.image, site.url),
    email: member.email || undefined,
    telephone: member.phone || undefined,
    url: absoluteUrl(`/team#${member.slug}`, site.url),
    sameAs: member.linkedin ? [member.linkedin] : undefined,
    knowsAbout: member.expertise.length > 0 ? member.expertise : undefined,
    hasCredential: member.qualification
      ? {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: member.qualification,
        }
      : undefined,
    worksFor: { '@id': ORGANISATION_ID },
    address: postalAddress(),
  };
}

/** Ordered list of attorneys for the team page. */
export function attorneyListSchema(members: TeamMember[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Advocates at ${site.name}`,
    itemListElement: members.map((member, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: attorneySchema(member),
    })),
  };
}

export function faqPageSchema(items: Faq[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href, site.url),
    })),
  };
}

/**
 * Client reviews.
 *
 * Note: Google restricts self-serving `Review`/`AggregateRating` markup on an
 * organisation's own pages, so these are emitted as plain Review nodes without
 * an aggregate rating. Some jurisdictions also restrict advocate testimonials
 * altogether — see README §"Regulatory note" before publishing.
 */
export function reviewSchema(items: Testimonial[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Client testimonials — ${site.name}`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: item.name },
        reviewBody: item.quote,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: item.rating,
          bestRating: 5,
          worstRating: 1,
        },
        itemReviewed: { '@id': ORGANISATION_ID },
      },
    })),
  };
}
