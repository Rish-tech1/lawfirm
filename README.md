# Singla & Singla Law Firm

A premium, SEO-optimised website for a full-service legal practice.

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 on the front,
Express + MongoDB + Nodemailer on the back. No CMS and no admin panel — all copy
lives in structured JSON files in the repository.

---

## Contents

- [Quick start](#quick-start)
- [Placeholders you must replace](#placeholders-you-must-replace)
- [Email setup](#email-setup)
- [MongoDB Atlas setup](#mongodb-atlas-setup)
- [Editing content](#editing-content)
- [Project structure](#project-structure)
- [Architecture notes](#architecture-notes)
- [API reference](#api-reference)
- [Spam protection](#spam-protection)
- [SEO](#seo)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Smoke tests](#smoke-tests)
- [Regulatory note](#regulatory-note)

---

## Quick start

Requires **Node 20+**.

```bash
# 1. Install both workspaces from the repository root
npm install

# 2. Create the two env files
cp client/.env.local.example client/.env.local
cp server/.env.example      server/.env
#   (Windows PowerShell: Copy-Item client\.env.local.example client\.env.local)

# 3. Run frontend and backend together
npm run dev
```

| Service  | URL                             |
| -------- | ------------------------------- |
| Frontend | http://localhost:3000           |
| API      | http://localhost:5000           |
| Health   | http://localhost:5000/api/health |

Run them separately with `npm run dev:client` / `npm run dev:server`.

**The site runs with no configuration at all.** Every page renders from local
JSON, so you can develop without MongoDB, Gmail or reCAPTCHA. Only the contact
form needs the backend, and the backend degrades loudly rather than refusing to
start — check `/api/health` to see which subsystems are live.

Other scripts:

```bash
npm run build       # production build of the frontend
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run start:server
```

### Verification status

Everything below was actually executed against this code, not assumed:

| Check                       | Result                                          |
| --------------------------- | ----------------------------------------------- |
| `npm install`               | ✅ 469 packages                                  |
| `npm run typecheck`         | ✅ clean                                         |
| `npm run lint`              | ✅ clean                                         |
| `npm run build`             | ✅ 29 routes, all prerendered static             |
| API boot + all `GET` routes | ✅ verified (see [Smoke tests](#smoke-tests))    |
| `POST /api/contact` paths   | ✅ valid / validation / honeypot / timing        |
| Lighthouse                  | ⚠️ 93 / 100 / 100 / 100 — see [Performance](#performance) |

Two bugs were found and fixed by this testing rather than by reading the code,
both worth knowing about if you touch the relevant areas:

1. **The honeypot returned 422 instead of a silent 200.** The Zod schema rejected
   a filled honeypot field before the controller's check could drop it quietly,
   which told a bot exactly which trap caught it — and would have handed a real
   user an unfixable validation error on an invisible field if their browser
   autofilled it. The honeypot field is now deliberately permissive in both
   schemas; the controller alone acts on it.
2. **Three accessibility failures** that static review missed: `aria-label` on
   roleless `<span>`s in the animated counters (prohibited ARIA), `gold-600` text
   on white at 2.8:1 (contrast), and a "Call Now" button whose `aria-label` did
   not contain its visible text (WCAG 2.5.3 Label in Name). All three are fixed
   and Accessibility now scores 100.

---

## Placeholders you must replace

Every invented value is in **one file**: [`client/content/site.ts`](client/content/site.ts).
Search it for `PLACEHOLDER`.

| Value                  | Where it appears                                                  |
| ---------------------- | ----------------------------------------------------------------- |
| Phone numbers          | Navbar, footer, hero CTA, contact page, email templates, schema    |
| Email addresses        | Navbar, footer, contact page, `mailto:` links, schema              |
| Office address         | Footer, contact page, Google Map, LocalBusiness schema             |
| `geo` latitude/longitude | Map marker and LocalBusiness schema                             |
| WhatsApp number        | Floating button, CTA banner (also set `NEXT_PUBLIC_WHATSAPP_NUMBER`) |
| Social profile URLs    | Footer icons, `sameAs` in schema — delete any the firm lacks       |
| `registration`         | Hero eyebrow, footer disclaimer                                   |
| `foundingYear`         | Hero, footer, About page, plaque                                  |

Also replace:

- **Team details** — `client/content/data/team.json`. Names, qualifications,
  bar-council enrolment numbers, emails, phones and LinkedIn URLs are all
  invented. The `@…example` email domains and `example-` LinkedIn slugs are
  intentionally non-functional so nothing accidentally goes live.
- **Statistics** — `client/content/data/stats.json`. Do not publish figures the
  firm cannot substantiate.
- **Testimonials** — `client/content/data/testimonials.json`. Entirely fictional.
  Replace with consented, real accounts or delete the page. See
  [Regulatory note](#regulatory-note).
- **Imagery** — `client/public/images/**` are hand-authored SVG placeholders
  (chambers, portraits, office gallery). They are deliberately abstract so the
  site looks intentional before a photographer is booked, and they keep the repo
  light. Replace with real photography, then delete the `dangerouslyAllowSVG`
  block in `client/next.config.ts`.

---

## Email setup

The transport is provider-agnostic. Point these five variables at any SMTP
service — no code changes:

This project is configured for **Gmail via Nodemailer**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true           # true for port 465, false for 587 (STARTTLS)
SMTP_USER=<your gmail address>
SMTP_PASS=<16-char App Password>

MAIL_FROM_ADDRESS=<same gmail address>        # the visible sender
MAIL_FROM_NAME=Singla & Singla Law Firm
ENQUIRY_RECIPIENT=<where enquiries arrive>
```

Real values live in `server/.env`, which is gitignored — never commit them.

### `MAIL_FROM_ADDRESS` vs `SMTP_USER`

With Gmail these must be the **same address** (or an alias registered on that
account under *Send mail as*); Gmail rewrites or rejects any other sender.

They are separate settings because some relays issue a **login that is not a
mailbox**. On those, sending *from* the login fails or lands in spam, so the
visible sender is configured independently and must be verified with the
provider.

### Provider settings

| Provider | Host | Port | Secure | User | Pass |
| -------- | ---- | ---- | ------ | ---- | ---- |
| Gmail    | `smtp.gmail.com` | 465 | `true` | your address | 16-char App Password |
| Resend   | `smtp.resend.com` | 465 | `true` | `resend` | API key |

`GMAIL_USER` / `GMAIL_APP_PASSWORD` are still read as fallbacks, so older Gmail
deployments keep working without an env change.

**Gmail** requires an App Password — the account password is rejected. Enable
2-Step Verification, then create one at
<https://myaccount.google.com/apppasswords>. Spaces are stripped. Note the
~500/day cap.

### Development fallback

If the configured transport fails to verify at boot, a **development** server
falls back to an [Ethereal](https://ethereal.email) test inbox and logs a
preview URL for every email:

```
[mail] Real transport unavailable (Invalid login: 525 5.7.1 Unauthorized IP address).
[mail] Falling back to an Ethereal test inbox for development.
[mail] Firm notification preview: https://ethereal.email/message/...
```

Emails are **captured, not delivered** — nothing reaches a real inbox. This keeps
the contact form testable while a provider is being sorted out, and it is
**disabled entirely when `NODE_ENV=production`**: silently diverting a real
client's enquiry to a fake inbox would be far worse than failing loudly. Set
`MAIL_DEV_FALLBACK=false` to switch it off in development too.

`GET /api/health` reports which transport is live:

```json
{ "mail": "configured" }                                        // real provider
{ "mail": "dev-fallback (Ethereal — captured, not delivered)" }  // fallback
{ "mail": "not-configured" }                                    // no credentials
```

### What gets sent

Two emails per submission:

- **To the firm** (`ENQUIRY_RECIPIENT`) — full enquiry detail, with `Reply-To`
  set to the enquirer so hitting Reply goes to the client.
- **To the client** (whatever address they typed in the form) — a branded
  acknowledgement promising a response within one working day, marked
  `Auto-Submitted: auto-replied` so out-of-office replies do not bounce back.

Credentials are verified at boot, not on first enquiry, so a misconfiguration
appears in the deploy log rather than as a lost client message hours later.

### Troubleshooting

| Symptom | Cause |
| ------- | ----- |
| `535 authentication failed` | Wrong username or password/key. With Gmail this usually means the account password was used instead of a 16-char App Password. |
| `525 5.7.1 Unauthorized IP address` | Credentials are **valid**; the provider is blocking the sending machine. Allowlist the IP in the provider's dashboard, or the account is still pending activation review. |
| `553` / `501` sender rejected | `MAIL_FROM_ADDRESS` is not verified with the provider. With Gmail, it must equal `SMTP_USER` or a registered *Send mail as* alias. |
| Form succeeds, record saved, **no email arrives** | Check `/api/health`. If `mail` reads `dev-fallback (Ethereal …)`, the real transport failed to verify at boot and mail is being captured, not delivered — the send path looks healthy while nothing leaves. Fix the transport and restart. Set `MAIL_DEV_FALLBACK=false` to make this fail loudly instead. |
| Changed `.env` but nothing changed | `dotenv` reads the file once at boot and nodemon does not watch `.env` — restart the server. |
| Form returns "could not record your enquiry" | Neither the database *nor* email worked — the one case where the enquiry is genuinely lost, so the visitor is told to phone. Fix either subsystem and it clears. |

---

## MongoDB Atlas setup

1. Create a free M0 cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user with `readWrite` on your database.
3. **Network Access** → allow your deployment's egress IPs. Render and Railway do
   not publish static IPs on their lower tiers, so `0.0.0.0/0` is often the only
   option there — if you use it, make the database password long and unique,
   since it becomes your only access control.
4. Copy the connection string into `MONGODB_URI`, percent-encoding any special
   characters in the password.

Enquiries land in the `enquiries` collection with a `status` field
(`new` → `contacted` → `consultation-booked` → `closed`, or `spam`) for whoever
triages the inbox, plus an `emailStatus` sub-document recording whether each
email actually sent — which makes failed sends findable and retryable.

---

## Editing content

All site copy is JSON under `client/content/data/`:

| File                  | Drives                                                      |
| --------------------- | ----------------------------------------------------------- |
| `practice-areas.json` | Practice-area grid **and** each `/practice-areas/[slug]` page |
| `services.json`       | Services page cards                                          |
| `team.json`           | Team page and home-page preview                              |
| `testimonials.json`   | Testimonial slider and testimonials page                     |
| `faqs.json`           | FAQ page, home preview, and FAQPage schema                   |
| `stats.json`          | Animated counters                                            |
| `why-choose-us.json`  | "Why Choose Us" feature grid                                 |
| `timeline.json`       | About-page milestone timeline                                |
| `gallery.json`        | Office gallery                                               |
| `firm.json`           | About-page prose, mission, vision, values, founder message   |

Editing rules:

- **Types are enforced.** `client/types/index.ts` describes every shape; a typo
  or missing field fails `npm run typecheck`, not silently at runtime.
- **`icon` fields are keys, not components.** Valid values are the keys of the
  registry in `client/components/ui/Icon.tsx`. Adding an icon means adding it
  there *and* to the `IconName` union.
- **Adding a practice area** is a single JSON entry. Its detail page, sitemap
  entry, footer link, contact-form dropdown option and JSON-LD are all derived.
- **`featured: true`** promotes a practice area to the home-page grid or an FAQ
  to the home-page preview.
- **Restart the server** after editing content — the API caches these files at
  boot. The frontend picks changes up through hot reload in dev, and at build
  time in production.

---

## Project structure

```
singlalawfirm/
├── client/                        # Next.js 15 frontend
│   ├── app/                       # App Router routes
│   │   ├── layout.tsx             # fonts, metadata, shell, site-wide JSON-LD
│   │   ├── page.tsx               # home
│   │   ├── about|services|practice-areas|team|testimonials|faq|contact/
│   │   ├── practice-areas/[slug]/ # 14 statically generated detail pages
│   │   ├── not-found.tsx          # custom 404
│   │   ├── loading.tsx            # route-level skeletons
│   │   ├── sitemap.ts             # /sitemap.xml
│   │   ├── robots.ts              # /robots.txt
│   │   ├── opengraph-image.tsx    # generated OG/Twitter card
│   │   ├── icon.svg
│   │   └── globals.css            # Tailwind v4 theme tokens
│   ├── components/
│   │   ├── ui/                    # Button, Container, SectionHeading, Reveal,
│   │   │                          # Counter, StarRating, Accordion, Breadcrumbs,
│   │   │                          # Skeleton, Icon, JsonLd, ToastProvider
│   │   ├── cards/                 # PracticeArea, Service, Team, Testimonial, Feature
│   │   ├── layout/                # Navbar, Footer, Logo, PageBanner,
│   │   │                          # WhatsAppButton, BackToTop
│   │   ├── forms/ContactForm.tsx
│   │   └── GoogleMap.tsx
│   ├── sections/                  # Composed page sections
│   ├── content/                   # site.ts config + data/*.json + typed accessors
│   ├── hooks/                     # useCountUp, useRecaptcha
│   ├── lib/                       # utils, validation, jsonld, api
│   ├── types/
│   └── public/images/             # SVG placeholder artwork
│
├── server/                        # Express API
│   ├── app.js                     # middleware + routes (importable for tests)
│   ├── server.js                  # boot, listener, graceful shutdown
│   ├── config/                    # env validation, database connection
│   ├── controllers/               # contact, content
│   ├── middleware/                # errorHandler, rateLimiter
│   ├── models/Enquiry.js
│   ├── routes/
│   ├── services/                  # mailer, emailTemplates, recaptcha, contentStore
│   └── utils/                     # logger, ApiError, validators
│
├── .env.example                   # annotated reference for both workspaces
└── package.json                   # npm workspaces + concurrently
```

---

## Architecture notes

### Why the site does not fetch its content

The frontend imports `client/content/data/*.json` directly and renders every
page as static HTML at build time. It never calls `GET /api/services` and
friends.

That is deliberate. Fetching static copy over HTTP at request time would add a
network round trip to every page load, make the site's availability depend on the
API's, and break the Lighthouse targets — all to retrieve text that only changes
on deploy. Static rendering gives near-instant loads, trivially crawlable HTML,
and a site that stays up even if the API is down.

The `GET` endpoints still exist as required deliverables, and read *the same JSON
files* rather than a copy — so they can serve a future mobile app or internal
dashboard without any risk of drifting from what the website shows.
`POST /api/contact` is the one genuinely dynamic operation, and it is the only
thing the site calls.

Consequence for deployment: the API reads `../client/content/data`, so **deploy
the repository root to the backend host, not `server/` alone.** If the directory
is missing, content endpoints return empty arrays with a warning and
`/api/contact` continues to work normally.

### Client/server boundary

Server Components are the default. Only genuinely interactive pieces carry
`'use client'`: `Navbar`, `ContactForm`, `TestimonialsSlider`, `Accordion`,
`Counter`, `GoogleMap`, `WhatsAppButton`, `BackToTop`, `RevealObserver`,
`ToastProvider`. Everything else — all page shells, every card, the hero,
`Reveal`/`Stagger` — ships zero JavaScript.

### Animation: CSS first, Framer Motion where it earns its place

The brief asked for Framer Motion to drive the scroll reveals, counters and hero
entrance, *and* for Performance 95+. Those two pull against each other, and the
first build showed how much: every revealed element was its own Framer Motion
client component — around forty on the home page — which dominated hydration and
put Total Blocking Time at 290 ms.

So the motion design is unchanged, but the mechanism is not:

- **Scroll reveals** (`Reveal`, `Stagger`, `StaggerItem`) are server components
  that emit `data-reveal`, animated by CSS transitions. One shared
  IntersectionObserver (`RevealObserver`) marks elements as they enter.
- **Above-the-fold entrances** (`Hero`, `PageBanner`) use `.reveal-on-load`, a
  pure CSS animation, because an observer cannot fire until hydration.
- **Counters** use a plain IntersectionObserver and `requestAnimationFrame`.
- **Accordion** animates `grid-template-rows: 0fr → 1fr`.
- **Navbar drawer, back-to-top, WhatsApp button** are CSS transitions.
- **Framer Motion** remains for the contact form's success transition, inside the
  lazily-loaded form chunk — off the critical path entirely.

Net effect: TBT 290 ms → 100 ms, and 30–40 kB off every route's First Load JS.
If you would rather have Framer Motion throughout as originally specified, the
call sites are unchanged — reverting means reimplementing `Reveal` with `motion`
and accepting the lower Performance score.

### Enquiry durability

`POST /api/contact` persists before it emails. If SMTP fails, the enquiry is
still on record; the reverse order would lose it. The client only sees an error
if the enquiry could be *neither* stored nor emailed — the one case where it is
genuinely lost and the user needs to be told to phone instead.

---

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                    | Notes                                        |
| ------ | --------------------------- | -------------------------------------------- |
| `GET`  | `/health`                   | Subsystem status: database, mail, reCAPTCHA   |
| `POST` | `/contact`                  | Store enquiry + send both emails. Rate limited |
| `GET`  | `/practice-areas`           | `?featured=true` filters to the home-page set |
| `GET`  | `/practice-areas/:slug`     |                                              |
| `GET`  | `/services`                 |                                              |
| `GET`  | `/team`                     |                                              |
| `GET`  | `/team/:slug`               |                                              |
| `GET`  | `/testimonials`             | `?practiceArea=Family%20Law`                 |
| `GET`  | `/faqs`                     | `?category=Fees`, `?featured=true`           |
| `GET`  | `/content`                  | Everything, one round trip                   |

All responses share one envelope:

```json
{ "success": true, "message": "OK", "count": 14, "data": [] }
```

Errors add field-level detail where relevant:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields and try again.",
  "errors": { "email": ["Please enter a valid email address."] }
}
```

Status codes: `201` created · `400` bad request · `404` not found ·
`422` validation · `429` rate limited · `500` server error.

---

## Spam protection

Four layers, and the form works with **zero configuration**:

1. **Honeypot** — a hidden `website` field, concealed from sighted users and
   screen readers alike. Any content means a bot filled it.
2. **Timing check** — submissions faster than 3 seconds are scripted.
3. **Rate limiting** — 5 submissions per IP per 15 minutes (configurable), plus a
   120 req/min ceiling on everything else.
4. **reCAPTCHA v3** — *optional*. Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and
   `RECAPTCHA_SECRET_KEY` to enable. Without them the first three layers apply.

Two deliberate behaviours worth knowing:

- **Bots receive a success response.** Honeypot and timing failures return `200`
  with the normal thank-you message. A distinct rejection would tell an attacker
  exactly which check caught them.
- **reCAPTCHA fails open.** If Google is unreachable or times out, the submission
  is allowed. A third-party outage should not stop someone instructing a lawyer.

Duplicate identical submissions from the same address within 2 minutes are
treated as a double-click and silently ignored.

---

## SEO

- Per-page `title`, `description`, `keywords` and canonical URL via the Metadata API
- Open Graph + Twitter card tags, with a generated OG image (`app/opengraph-image.tsx`)
- `sitemap.xml` and `robots.txt` generated from the content data — a new practice
  area appears in both automatically
- `NEXT_PUBLIC_ALLOW_INDEXING=false` blocks crawlers on staging deploys
- Visible breadcrumbs plus matching `BreadcrumbList` schema on every inner page
- JSON-LD: `LegalService` + `LocalBusiness` (with opening hours, geo, `areaServed`),
  `WebSite`, `OfferCatalog`, per-area `LegalService`, `Attorney` per advocate,
  `FAQPage`, `BreadcrumbList`, `Review`
- Semantic HTML5 with one `h1` per page and a correct `h2`/`h3` descent
- Descriptive `alt` text on every image; decorative art uses `alt=""`
- Internal linking: footer practice-area and service columns, related-areas
  block on each detail page, recovery links on the 404
- FAQ answers stay in the DOM when the accordion is collapsed (height-collapsed,
  not unmounted) so they remain indexable

Validate structured data at <https://search.google.com/test/rich-results>.

### Deepening a practice-area page

Each entry in `practice-areas.json` takes four **optional** fields. Every one of
them renders only when present, so an area that declares none looks exactly as it
did before they existed — fill them in area by area, at whatever pace suits.

`cheque-bounce` is filled in as a **worked reference example**. Copy its shape.
It was drafted against the bare Acts and **has not been reviewed by the firm** —
read it before you rely on it, and treat it as a template rather than as
published copy.

| Field      | Renders as                          | Why it matters                                                     |
| ---------- | ----------------------------------- | ------------------------------------------------------------------ |
| `faqs`     | Accordion + `FAQPage` structured data | The highest-value field. Makes answers eligible to appear as expandable rows under the search result |
| `keyLaws`  | "Governing Law" grid + schema `about` | States the page's subject in a form that does not depend on parsing prose |
| `courts`   | "Where We Appear" chips             | Carries local intent onto the page — this is what "lawyer near me" matches against |
| `related`  | The "Related" block                 | Without it, related areas are picked by position in the JSON file, linking Corporate Law to Civil Litigation because one follows the other |

Two more rules worth following:

- **Set `updated` when you edit an entry.** It becomes that URL's `lastmod` in
  the sitemap. Leave it off and the area inherits `CONTENT_LAST_REVIEWED` from
  `content/site.ts`.
- **Write answers that stand alone.** Six substantial FAQ answers roughly double
  a practice-area page's word count, which is the single biggest lever available
  without adding routes. Two-line answers add markup but no substance.

### Known gaps

Deliberately out of scope in the current build, in rough order of what they'd be
worth:

1. **No blog or articles section.** 20 URLs total. There is no surface for
   informational queries, which is where most legal search volume sits.
2. **No location pages.** The firm practises across Delhi NCR and has chambers at
   Karkardooma, Trilokpuri and Mayur Vihar, but no page targets a place name.
3. **No per-advocate pages.** All eleven sit on `/team`, so there is nothing to
   rank for an advocate's own name and little to carry author credibility.
4. **Practice-area overviews run 60–105 words.** Competing Delhi firms run
   considerably longer. The optional fields above are the cheapest way to close
   this without a rewrite.

**After deploying:** set `NEXT_PUBLIC_SITE_URL` to the real domain, submit
`sitemap.xml` in Google Search Console, and create a Google Business Profile —
for a local law firm that drives more enquiries than any on-page work.

---

## Performance

### Measured results

Lighthouse 12, mobile preset, run against `next start` on **localhost**:

| Category       | Target | Measured |
| -------------- | ------ | -------- |
| Performance    | 95+    | **93**   |
| Accessibility  | 95+    | **100**  |
| Best Practices | 100    | **100**  |
| SEO            | 95+    | **100**  |

Core Web Vitals from the same run: **CLS 0**, **TBT 100 ms**, simulated LCP 3.0 s,
simulated FCP 1.7 s.

**Performance came in at 93, two points under target — read the caveat before
acting on it.** In the same trace, `observedLargestContentfulPaint` is **1298 ms**,
identical to observed FCP, and `lcp-discovery-insight` is `notApplicable` — i.e.
the LCP element is text that paints immediately, and nothing renders late. The
3.0 s figure is Lighthouse's *simulated* throttling applied on top of a 459 ms
localhost TTFB from a single-threaded `next start` process.

That number is a floor, not the production figure. On Vercel's edge — CDN TTFB,
Brotli, HTTP/2 — the same build should score higher. **Re-measure against the
deployed URL before treating 93 as the real result**, and if it still falls short
there, the lever is total critical bytes: the home page renders every section at
~49 kB of HTML, so trimming what it includes is the honest fix.

Things I tested that did *not* move the needle, so you needn't repeat them:
dropping the display font's `preload` (no change), and removing the `h1`
entrance animation (no change).

### What the score is built on

- Static generation for all 29 routes; no per-request server work outside `/api/contact`
- Server Components by default (see [Client/server boundary](#clientserver-boundary))
- CSS-driven animation rather than a per-element animation library (see
  [Animation](#animation-css-first-framer-motion-where-it-earns-its-place))
- `next/font` self-hosts Playfair Display and Inter at build time — no runtime
  request to Google, no render-blocking stylesheet, `adjustFontFallback` holding
  CLS at 0. Only four weights are requested; **add a weight here if you introduce
  one in the design**, or the browser will synthesise it
- The hero backdrop is inline SVG, not a fetched asset — it was the LCP element
  and cost a round trip after HTML and CSS
- The contact form is code-split behind an IntersectionObserver
  (`ContactFormLazy`), keeping react-hook-form + zod + axios (~60 kB) off three
  routes that only need them below the fold
- The Google Map iframe mounts only when scrolled into view, keeping a heavy
  third-party embed out of the initial load entirely
- The WhatsApp button mounts after 1.4s so it never competes for main-thread time
  during the LCP window
- `optimizePackageImports` for `react-icons` and `framer-motion` ships only what
  is imported
- Long-lived immutable caching on `/images/*`

After `npm install`, measure a real production build rather than dev mode:

```bash
npm run build && npm run start:client
npx lighthouse http://localhost:3000 --view
```

---

## Accessibility

- Skip-to-content link, visible gold focus rings on all interactive elements
- Mobile drawer traps nothing it shouldn't: closes on Escape, on route change and
  on backdrop click, locks background scroll, and moves focus to its close button
- Form inputs use real `<label>`s, `aria-invalid`, `aria-describedby`, and
  `role="alert"` on error messages
- `prefers-reduced-motion` is honoured globally in CSS and in the reveal rules —
  reduced-motion users get the final state immediately rather than a hidden
  element, and the counters skip straight to their final value
- Animated counters expose their final value through a visually hidden span. An
  `aria-label` on the wrapping `<span>` would be a prohibited ARIA attribute on a
  roleless element — that was a real audit failure here, not a hypothetical
- Content is never hidden by a reveal that JavaScript failed to trigger: the CSS
  hidden state is gated on an attribute set by an inline script, so with
  JavaScript disabled nothing is hidden at all
- Carousel is a keyboard-scrollable labelled region built on native scroll-snap
- Decorative SVG is `aria-hidden`; meaningful icons take a label

---

## Deployment

### Frontend — Vercel

1. Import the repository.
2. **Root Directory:** `client`
3. Framework preset: Next.js (build/output settings are detected).
4. Environment variables: the `NEXT_PUBLIC_*` block from `.env.example`. Set
   `NEXT_PUBLIC_SITE_URL` to the production domain and `NEXT_PUBLIC_API_URL` to
   the deployed API origin **including `/api`**.

### Backend — Render or Railway

1. New Web Service from the same repository.
2. **Root Directory: leave as the repository root** — not `server`. The API reads
   `client/content/data`, so the client workspace must be present. (See
   [Architecture notes](#architecture-notes).)
3. Build command: `npm install`
4. Start command: `npm run start:server`
5. Environment variables: the server block from `.env.example`. Set `NODE_ENV=production`
   and add the Vercel domain to `ALLOWED_ORIGINS`.
6. Health check path: `/api/health`

Render's free tier idles after inactivity, so the first enquiry after a quiet
period may take ~30s while the service wakes. Use a paid instance, or a cron ping
against `/api/health`, if that matters.

### Database — MongoDB Atlas

See [MongoDB Atlas setup](#mongodb-atlas-setup).

### Post-deploy checklist

- [ ] `/api/health` reports `database: connected` and `mail: configured`
- [ ] Submit a real enquiry; confirm both emails arrive and the document is in Atlas
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain (canonicals and sitemap depend on it)
- [ ] `robots.txt` and `sitemap.xml` return the production domain
- [ ] Rich Results Test passes on home, a practice-area page, and the FAQ page
- [ ] Lighthouse run against the production URL
- [ ] Every placeholder from [the table above](#placeholders-you-must-replace) replaced

---

## Smoke tests

```bash
# Health
curl http://localhost:5000/api/health

# Content
curl http://localhost:5000/api/practice-areas | head -c 400
curl "http://localhost:5000/api/faqs?category=Fees"

# Valid enquiry — expect 201
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Test Client",
    "email":"test@example.com",
    "phone":"+91 98765 43210",
    "practiceArea":"Civil Litigation",
    "subject":"Test enquiry",
    "message":"This is a test enquiry with more than twenty characters.",
    "consent":true,
    "elapsedMs":9000
  }'

# Validation failure — expect 422 with field errors
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"fullName":"X","email":"nope","phone":"1","practiceArea":"","subject":"","message":"","consent":false}'

# Honeypot — expect 200 with the normal success message, and nothing stored
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Bot","email":"bot@example.com","phone":"+919876543210",
    "practiceArea":"Civil Litigation","subject":"Spam",
    "message":"This should be silently discarded by the honeypot.",
    "consent":true,"website":"http://spam.example","elapsedMs":9000
  }'
```

---

## Regulatory note

Worth raising before this goes live, because it is a real constraint rather than a
stylistic one.

The Bar Council of India's Rule 36 restricts advertising and solicitation by
advocates. Testimonials, claimed success rates, and figures such as "Cases Won"
are the categories most often challenged under it. This build includes them
because they were specified, but they are the parts of the site most likely to
need changing.

What has been done to reduce exposure:

- A non-solicitation disclaimer sits in the footer on every page
- The testimonials page carries a past-results notice
- `stats.json` and `testimonials.json` are single-file edits, so figures can be
  reworded or the page dropped without touching components
- `mainNav` in `client/content/site.ts` controls navigation, so removing the
  testimonials entry removes it everywhere

Options if the firm's compliance view is conservative: reword `stats.json`
(e.g. "Matters Handled" rather than "Cases Won"), delete `testimonials.json`
content and drop the route, or add the entry-disclaimer interstitial that many
Indian firm sites use. I'd suggest confirming the firm's own position with their
compliance adviser before publishing — none of this is legal advice, and the
answer varies by state bar council.

Separately: the enquiry record stores IP address and user agent for abuse
investigation. That is personal data under the DPDP Act and most other privacy
regimes. Add a privacy policy covering it and set a retention period.
