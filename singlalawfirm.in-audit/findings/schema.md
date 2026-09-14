# Schema.org Audit — singlalawfirm.in

Verified by live fetch (raw HTML, server-rendered — confirmed via `render_page.py --mode auto`, no SPA client-injection) for: `/`, `/team`, `/practice-areas/corporate-law`, `/testimonials`. Source-reviewed for all other routes (`client/lib/jsonld.ts`, `client/app/**/page.tsx`, `client/content/data/*.json`).

## Schema score: 78/100

Architecture is well above typical small-firm sites — single source of truth (`lib/jsonld.ts`), stable `@id` graph linking, correct subtype selection, and a deliberate, correct decision to withhold `AggregateRating` on self-hosted reviews. Score is held down by one **critical live data-integrity bug** (placeholder LinkedIn URLs shipped as real `sameAs` claims) and several minor completeness gaps.

## What exists today (per page)

| Page | JSON-LD blocks |
|---|---|
| Every page (root layout) | `LegalService`+`LocalBusiness` (`@id #organisation`), `WebSite` (`@id #website`, `publisher` → org) |
| `/` | + `OfferCatalog`/`Offer`/`Service` (12 practice areas), `FAQPage` (6 featured Qs) |
| `/about` | + `BreadcrumbList` |
| `/services` | + `BreadcrumbList`, `OfferCatalog` (same catalogue) |
| `/practice-areas` | + `BreadcrumbList`, `OfferCatalog` (same catalogue) |
| `/practice-areas/{slug}` (×12) | + `BreadcrumbList`, `LegalService` (per-area, `hasOfferCatalog`, `about: Legislation[]`), `FAQPage` **only on `cheque-bounce`** (11 of 12 areas have zero authored FAQs, so no block — not a bug, just uneven content) |
| `/team` | + `BreadcrumbList`, `ItemList` of `Attorney` (11 members) |
| `/testimonials` | + `BreadcrumbList`, `ItemList` of `Review` (no `AggregateRating`) |
| `/faq` | + `BreadcrumbList`, `FAQPage` (all questions) |
| `/contact` | + `BreadcrumbList` only (relies on sitewide org node — correct, avoids duplicating LocalBusiness) |

All blocks tested: `@context: https://schema.org` ✅, absolute URLs ✅, ISO 8601 not applicable (no `datePublished` fields present, none required for these types) ✅, ids stable and correctly resolved to `https://www.singlalawfirm.in/...` in the **live** render — confirms `NEXT_PUBLIC_SITE_URL` is correctly set to `.in` in production even though the source fallback in `content/site.ts` defaults to `.com` (see Finding 4).

## Findings

### 1. CRITICAL — Placeholder LinkedIn URLs live in production `Attorney.sameAs`
**Evidence:** `client/content/data/team.json` — 7 of 11 team members have `"linkedin": "https://www.linkedin.com/in/example-<slug>"` (e.g. `example-naveen-singla`, `example-ria-goyal`, `example-kushal-kumar`, `example-arjun-mavi`, `example-rishabh-singla`, `example-akriti-mishra`, `example-priya-pal`). Confirmed present verbatim in the **live** `/team` page HTML and JSON-LD (`sameAs` array).
**Why it matters:** `sameAs` is a factual entity-resolution claim that Google fetches and uses to consolidate identity. Shipping invented URLs is placeholder text in production markup (violates the "no placeholder text" check) and risks linking the firm's advocates to LinkedIn handles that either don't exist or, worse, belong to someone else.
**Fix:** Set `linkedin: null` for every member without a confirmed real profile (the codebase already has this exact pattern for `site.social.facebook/twitter/instagram` — apply it here). Only populate once a real, verified URL exists.

### 2. Info — FAQPage markup (retired rich result)
**Evidence:** `FAQPage` present on `/`, `/faq`, `/practice-areas/cheque-bounce`.
Google retired FAQ rich results for all sites on 7 May 2026 (today is past that date). This markup no longer produces a SERP feature. **Do not remove it** — no harm in keeping it — and do not add it to the remaining 11 practice-area pages expecting a ranking or SERP benefit. Any AI/LLM citation benefit from `FAQPage` is unconfirmed; treat it as neutral, not a growth lever. If genuine user-submitted Q&A content is ever added, use `QAPage`, not `FAQPage`.

### 3. Pass — Review/testimonial markup is compliant by design
**Evidence:** `reviewSchema()` in `lib/jsonld.ts` deliberately emits `Review` nodes with **no** `AggregateRating`, with an inline code comment citing Google's restriction on self-serving review rich results for a business's own pages. `/testimonials` also carries a visible disclaimer about consent and no-guarantee-of-outcome language, which is the right posture given Bar Council of India Rule 36 restrictions on advocate solicitation/self-promotion. **No fix needed** — this is correctly built and should not be "upgraded" to add star ratings.

### 4. Info — Site URL fallback mismatch (no live impact, but a latent risk)
**Evidence:** `content/site.ts`: `envOr(process.env.NEXT_PUBLIC_SITE_URL, 'https://www.singlalawfirm.com')` — fallback is `.com`, but the live domain is `.in`. Live JSON-LD correctly resolves to `https://www.singlalawfirm.in/...`, confirming the env var is set correctly in the current deployment.
**Risk:** if `NEXT_PUBLIC_SITE_URL` is ever unset on a redeploy/preview environment, every `@id`, canonical, and absolute URL in structured data silently reverts to the wrong domain across `Organization`, `WebSite`, `BreadcrumbList`, and `Service` nodes.
**Fix:** change the fallback constant to `https://www.singlalawfirm.in` so a misconfigured env var fails safe.

### 5. Minor — `Attorney` nodes have no stable `@id`
**Evidence:** `attorneySchema()` builds `url: .../team#slug` but does not set `@id`. Same person's summary may also appear in a `TeamPreview` section on the homepage without being tied to the same node.
**Fix:** add `'@id': absoluteUrl(`/team#${member.slug}`, site.url)` to `attorneySchema()` so any future reuse (homepage preview, practice-area "led by") dedupes to one entity instead of emitting duplicate anonymous `Attorney` nodes.

### 6. Minor — Non-standard `contactType` value
**Evidence:** `contactPoint.contactType: 'Client enquiries'` — schema.org allows free text, but Google's own contact-related eligibility guidance references a conventional set (`customer service`, `sales`, `technical support`, `billing support`, etc.).
**Fix:** low priority; consider `'customer service'` (or add it as a second contactType) for broader parser compatibility. Not required.

### 7. Minor — Organisation node has no `hasOfferCatalog` back-reference
**Evidence:** `OfferCatalog` nodes point `provider: { '@id': ORGANISATION_ID }`, but the organisation node itself never declares `hasOfferCatalog` pointing back at the catalogue. One-directional linking works for Google's graph resolution but is asymmetric.
**Fix:** optional — add `hasOfferCatalog: { '@id': ... }` on the organisation node if a stable `@id` is added to the catalogue object.

### 8. Not verified
- `/about`, `/services`, `/practice-areas`, `/faq`, `/contact` were reviewed in source only (not live-fetched in this pass) — source code is identical in pattern to the four pages that were live-verified (`/`, `/team`, `/practice-areas/corporate-law`, `/testimonials`), so high confidence they match, but not independently confirmed live.
- The remaining 11 of 12 `/practice-areas/{slug}` pages were not individually live-fetched; only `corporate-law` was confirmed. Content-file inspection (`content/data/practice-areas.json`) confirms only `cheque-bounce` has authored FAQs, so `FAQPage` block presence/absence per slug is inferred from data, not from a live fetch of each URL.
- Rich Results Test / Schema.org validator was not run against the live URLs (no network access to Google's validator from this environment); validation above is structural (required/recommended properties, type correctness) rather than Google's own pass/fail report.

## Ready-to-paste fix — corrected `Attorney` schema (highest-value fix)

Replace the placeholder-`sameAs` version with this pattern (shown for the founder; apply the same `linkedin: null` correction to all 7 affected members in `content/data/team.json`, and add the `@id` field to `attorneySchema()` in `lib/jsonld.ts`):

```json
{
  "@context": "https://schema.org",
  "@type": "Attorney",
  "@id": "https://www.singlalawfirm.in/team#naveen-singla",
  "name": "Naveen Singla",
  "jobTitle": "Founding Partner",
  "description": "...",
  "image": "https://www.singlalawfirm.in/images/team/naveen-singla.jpg",
  "email": "naveensinglaadv1@gmail.com",
  "url": "https://www.singlalawfirm.in/team#naveen-singla",
  "knowsAbout": ["Civil Litigation", "Constitutional Law"],
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "degree",
    "name": "B.A. LL.B. (Hons.), LL.M. — Constitutional Law"
  },
  "worksFor": { "@id": "https://www.singlalawfirm.in/#organisation" },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Chamber No. F-622, F Block Lawyer's Chamber, 6th Floor, Karkardooma Court",
    "addressLocality": "Delhi",
    "addressRegion": "Delhi",
    "postalCode": "110032",
    "addressCountry": "IN"
  }
}
```

`sameAs` is omitted entirely rather than populated with an invented URL — re-add it only once a verified LinkedIn URL exists for this person.
