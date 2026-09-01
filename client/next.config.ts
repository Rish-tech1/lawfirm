import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

/**
 * The API lives on a separate origin in production (Render/Railway), so it has
 * to be named in `connect-src` or every enquiry POST is blocked. Derived from
 * the same env var the axios client uses, so the two can never drift apart.
 */
function apiOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * Content Security Policy.
 *
 * Note on `'unsafe-inline'` in `script-src`: the App Router emits inline
 * bootstrap/hydration scripts on every page. Replacing that with a nonce
 * requires generating one per request in middleware, which opts every route out
 * of static generation — all 30 pages here are currently prerendered, so a
 * nonce would trade the site's entire performance profile for the hardening.
 * For a brochure site with no authenticated session and no user-generated HTML,
 * that is the wrong trade. What this policy still buys is real: script, frame
 * and connect origins are allowlisted, `object-src` is dead, `base-uri` cannot
 * be repointed to hijack relative URLs, and `form-action` cannot be aimed at an
 * attacker's collector.
 *
 * `'unsafe-eval'` is development-only — the dev runtime needs it, production
 * must never ship it.
 */
function contentSecurityPolicy(): string {
  const api = apiOrigin();

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],

    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      // reCAPTCHA v3 loader and its runtime.
      'https://www.google.com',
      'https://www.gstatic.com',
    ],

    // The App Router emits inline <style> of its own; there is no nonce-free
    // alternative that keeps static rendering.
    'style-src': ["'self'", "'unsafe-inline'"],

    // The two woff2 files are served from /public/fonts on this origin (see the
    // font comment in app/globals.css), so no external font origin is needed.
    'font-src': ["'self'", 'data:'],

    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://images.unsplash.com',
      // Google Maps embed tiles.
      'https://maps.gstatic.com',
      'https://*.googleapis.com',
      'https://*.ggpht.com',
    ],

    'connect-src': ["'self'", ...(api ? [api] : []), 'https://www.google.com'],

    // The Maps embed and the reCAPTCHA challenge both render in iframes.
    'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],

    // Matches the X-Frame-Options: SAMEORIGIN below; modern browsers use this one.
    'frame-ancestors': ["'self'"],

    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');

  // Pointless against a local http dev server, and it would force-upgrade
  // http://localhost requests.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Keeps `next build` honest — a type or lint error should fail CI, not ship.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Swap in your real CDN/host here when photography replaces the bundled SVG art.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],

    /**
     * Next 16 requires every `quality` an <Image> asks for to be declared here,
     * so the optimiser cannot be driven to generate unbounded variants. Keep
     * this list in sync with the `quality={...}` props actually in use:
     *   60 — logo lockups (Logo.tsx)
     *   65 — chambers photography (AboutPreview.tsx, about/page.tsx)
     *   75 — Next's default, used by every <Image> without an explicit quality
     */
    qualities: [60, 65, 75],

    /**
     * The bundled placeholder artwork is SVG, which the image optimiser refuses
     * to serve unless explicitly allowed. That default guards against
     * user-uploaded SVG carrying scripts; every SVG here is authored in-repo
     * and served from /public, so the risk does not apply. The per-image
     * `contentSecurityPolicy` immediately below neutralises scripts in any
     * SVG the optimiser serves regardless (this is separate from the
     * page-level CSP in `headers()`).
     *
     * Once real photography (JPG/PNG/WebP) replaces the placeholders, this
     * block can be deleted.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    // Ships only the icons actually imported instead of the whole react-icons barrel.
    optimizePackageImports: ['react-icons'],

    /**
     * `inlineCss` was tried here and MEASURED WORSE — do not re-enable without
     * re-measuring. It removed the render-blocking stylesheet and improved FCP
     * (1.7s -> 1.2s), but the stylesheet lands in the RSC payload as well as the
     * document, so compressed HTML went 46 KiB -> 72 KiB. On a throttled
     * connection that pushed the first request out far enough to take LCP from
     * 3.8s to 4.8s and the score from 85 to 76. The stylesheet is only 14 KiB;
     * a separate cacheable request beats inflating every document by 26 KiB.
     */
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Legacy fallback for browsers that ignore CSP frame-ancestors.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          /**
           * Isolates this browsing context from any window that opens it, so a
           * `window.opener` reference cannot reach back into the page.
           * COEP is deliberately NOT set — it would break the Maps and
           * reCAPTCHA iframes, which do not send CORP headers.
           */
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          /**
           * Only emitted in production: sending HSTS from a local http dev
           * server would pin localhost to HTTPS in the developer's browser and
           * is a genuinely annoying thing to undo.
           */
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]),
        ],
      },
      {
        // Fingerprinted SVG art never changes under the same name.
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        /**
         * Self-hosted woff2 (see the font comment in app/globals.css). Files
         * under /public are served with `max-age=0` by default, which would make
         * the browser revalidate the two fonts on the critical path on every
         * navigation.
         *
         * `immutable` is a promise these bytes never change under this name. The
         * filenames are NOT content-hashed, so honour it: to change a font, add
         * the new file under a new name and update both the @font-face src and
         * FONT_PRELOADS in app/layout.tsx. Overwriting in place would leave
         * every returning visitor on the old face for up to a year.
         */
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
