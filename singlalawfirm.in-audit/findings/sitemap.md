# Sitemap & Site Architecture Audit — singlalawfirm.in

**Score: 84/100**

Source reviewed: `client/app/sitemap.ts`, `client/app/robots.ts`, `client/content/site.ts`,
`client/content/index.ts`, `client/app/practice-areas/[slug]/page.tsx`, `client/lib/utils.ts`,
`client/content/data/team.json`, full `app/` route tree.

## What works

- **`lastmod` anti-pattern already fixed.** `sitemap.ts` does not use `new Date()` at build time.
  It resolves each URL's `lastModified` from a per-route `updated` field, falling back to a
  hand-maintained `CONTENT_LAST_REVIEWED` constant (`'2026-09-05'` in `content/site.ts`). The code
  comments in both files correctly explain *why*: a build-timestamp `lastmod` falsely claims every
  page changed on every deploy, and a crawler that repeatedly finds no actual change discounts the
  signal. No fix needed here — flagging as a **pass**, not a finding.
- **Practice-area coverage is fully data-driven and matches reality.** `sitemap.ts` maps
  `practiceAreas` from `content/data/practice-areas.json` (12 entries) directly into
  `/practice-areas/{slug}`. `generateStaticParams()` in
  `app/practice-areas/[slug]/page.tsx` pre-renders exactly those 12 slugs, and
  `export const dynamicParams = false` makes any other slug 404 rather than soft-rendering an empty
  shell. Sitemap, route tree, and content source are in lockstep — zero drift risk, zero orphaned
  dynamic pages.
- **No deprecated-tag problem in substance.** `priority`/`changeFrequency` are emitted but Google
  ignores both; they're harmless. No action required, just noting Google won't act on them.
- **robots.txt is correct**: allows `/`, disallows `/api/` (no crawl value), declares the sitemap
  and host. No conflicts with the sitemap.
- **20 URLs is nowhere near the 50,000-URL / 50MB cap** — a sitemap index would be pure overhead
  at this size. Do not build one.
- **Hub → 12-spoke `/practice-areas` architecture is sound** for a firm this size: one hub page
  links to 12 genuinely distinct practice areas (corporate, criminal, family, property, tax,
  cyber, banking, etc.), each presumably with real legal-service content, not a templated
  city/keyword swap. This is the "safe at scale" pattern, not the doorway-page pattern.

## Findings

### 1. HIGH — Sitemap domain has a silent `.com` fallback, not `.in`
`content/site.ts`:
```ts
const siteUrl = envOr(process.env.NEXT_PUBLIC_SITE_URL, 'https://www.singlalawfirm.com').replace(
  /\/$/,
  '',
);
...
export const site = { ..., url: siteUrl, ... };
```
Every sitemap URL, canonical tag, Open Graph URL, and JSON-LD `url`/`sameAs` field is built from
`site.url` via `absoluteUrl(path, site.url)`. The fallback value is
`https://www.singlalawfirm.com` — a different TLD than the live site
(`https://www.singlalawfirm.in`), and one the firm may not even control. `.env.local` and
`.env.local.example` both set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local dev, so the
correct `.in` value must be set as a production environment variable somewhere outside this repo.
If that variable is ever missing, blank, misspelled, or dropped during a redeploy/host migration,
`envOr()`'s blank-string guard means it falls straight through to the `.com` fallback — and
**every URL sitewide silently re-points to the wrong domain** (sitemap, canonicals, structured
data) with no build error.
**Fix:** Fail the build instead of silently falling back for production. Something like:
```ts
const siteUrl = process.env.NODE_ENV === 'production'
  ? envOrThrow(process.env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL must be set in production')
  : envOr(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000');
```
or at minimum change the fallback literal to the real `.in` domain so a misconfiguration degrades
to "correct URL" instead of "wrong company's domain."

### 2. MEDIUM — Homepage canonical and sitemap `<loc>` disagree on trailing slash
`lib/utils.ts`:
```ts
export function absoluteUrl(path: string, baseUrl: string): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalised === '/' ? '' : normalised}`;
}
```
For the homepage route (`path: '/'`), this deliberately strips the trailing slash, so
`sitemap.ts` emits `<loc>https://www.singlalawfirm.in</loc>` — matches the sample sitemap given.
But `app/layout.tsx` and `app/page.tsx` both set `alternates: { canonical: '/' }` against
`metadataBase: new URL(site.url)`. Next.js resolves that with `new URL('/', base)`, which
**always** produces a trailing slash: `https://www.singlalawfirm.in/`. `next.config.js` has no
`trailingSlash` setting to normalize this. Result: the sitemap lists the no-slash URL, the
`<link rel="canonical">` on that same page declares the slash URL. Every other route (`/about`,
`/practice-areas/corporate-law`, etc.) does not have this problem since their paths aren't `/`.
**Fix:** Either special-case the homepage canonical to `''`/omit the leading path entirely so it
resolves without a trailing slash, or change `absoluteUrl`'s homepage branch to emit a trailing
slash to match Next's canonical resolution. Pick one convention and make both agree.

### 3. LOW/INFO — Two unused content pipelines: individual attorney pages and testimonials toggle
`content/index.ts` exports `getTeamMember(slug)`, and `content/data/team.json` has 11 team
members each with a real `slug` (`naveen-singla`, `ria-goyal`, `kushal-kumar`, etc.). No
`app/team/[slug]/page.tsx` route exists, so this accessor is dead code and there is no individual
attorney bio page for the sitemap to include, and no path for legal-directory/citation links or
attorney-specific schema (`Person` + `attorney` structured data, bar registration, individual
practice focus) to land on. This is infrastructure already half-built — turning it on is a
low-lift addition, not new-content work from scratch.

## Missing-page opportunities (not currently in the route tree or sitemap)

Searched the full `app/` tree — none of the following exist:

| Page type | Present? | Note |
|---|---|---|
| Blog / Insights | No | No content freshness signal beyond the 8 static pages + 12 practice areas; no long-tail query coverage. |
| Individual attorney pages (`/team/[slug]`) | No | Data exists (`team.json` slugs), route does not. See Finding 3. |
| Privacy Policy | No | Legally expected on any site with a contact form (`services.json`/`firm.json` collect an email); also a standard E-E-A-T/trust signal Google looks for on YMYL sites (law is YMYL). |
| Terms of Service | No | Same gap. |
| Attorney Advertising / Bar Council disclaimer page | No | `site.ts` already references `registration: 'Bar Council of Delhi-NCR'` and the code comments cite **Bar Council of India Rule 36** (advocate advertising restrictions) as a live concern for the testimonials page — a standalone disclaimer page is the standard way firms comply with Rule 36 while still describing services. Currently there's no dedicated page for this, only the toggle protecting testimonials. |
| Location pages | No | See gate below — do not add without justification. |

Recommended priority: Privacy Policy + Terms/Disclaimer first (trust/compliance, near-zero
content-quality risk), individual attorney pages second (data already modeled), blog last (highest
effort, only worth it with a real content/publishing commitment — do not spin up a thin blog just
to "have one").

## Location-page quality gate (enforced per policy — no location pages currently exist)

Current count: **0**. No action required today. If location pages are proposed later (e.g. one
per `areaServed` city — Delhi, New Delhi, Noida, Greater Noida, Ghaziabad, Gurugram, Faridabad =
7 cities):

- 7 pages is well under the 30-page WARNING threshold — not itself a problem.
- **Gate applies regardless of count**: each page must carry **60%+ unique content** (genuinely
  different court/jurisdiction info, local filing procedures, local case examples, a named
  attorney handling that jurisdiction) — not a templated page with only the city name swapped.
  A `[city]` template driven by the same `areaServed` array used in `site.ts`'s schema is exactly
  the doorway-page pattern Google's algorithm targets, and this firm already has the office/city
  data structured (`offices[]`, `areaServed[]`) in a way that makes a thin auto-generated template
  the path of least resistance — worth calling out before anyone builds it that way.
- **WARNING (60%+ unique content required) triggers at 30+ pages.**
- **HARD STOP triggers at 50+ pages** — requires explicit user/firm justification before proceeding.
- Neither threshold is close to being hit by the 7-city `areaServed` list, but if a future
  request asks for one page per neighborhood/court complex within each city, re-run this check
  before building — that's how a 7-page idea becomes a 50-page problem.

## Full coverage cross-check

Route files found in `app/`: `/`, `/about`, `/contact`, `/faq`, `/practice-areas`,
`/practice-areas/[slug]` (×12 via `generateStaticParams`), `/services`, `/team`,
`/testimonials`. Every one of these except the dynamic segment count matches `staticRoutes` in
`content/site.ts` plus the 12 JSON-driven practice areas — **20 total, sitemap = route tree,
no orphans in either direction.** `/testimonials` is conditionally included via
`showTestimonials` env flag; when off, it correctly drops from `mainNav`, `staticRoutes`, and by
extension `sitemap.ts` in one place — good single-source design, no stale link risk.
