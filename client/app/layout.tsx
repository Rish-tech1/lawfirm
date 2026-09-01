import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { JsonLd } from '@/components/ui/JsonLd';
import { RevealObserver, RevealReadyScript } from '@/components/ui/RevealObserver';
import { site } from '@/content/site';
import { organisationSchema, websiteSchema } from '@/lib/jsonld';
import './globals.css';

const WhatsAppButton = dynamic(() => import('@/components/layout/WhatsAppButton').then((mod) => mod.WhatsAppButton));
const BackToTop = dynamic(() => import('@/components/layout/BackToTop').then((mod) => mod.BackToTop));
const ToastProvider = dynamic(() => import('@/components/ui/ToastProvider').then((mod) => mod.ToastProvider));

/**
 * The two font families are declared by hand in app/globals.css and served from
 * /public/fonts rather than through `next/font/google`. The full reasoning is in
 * the comment at the top of that file; the short version is that the loader
 * emitted no preload links at all and ignored `subsets: ['latin']`.
 *
 * `FONT_PRELOADS` is the other half of that fix — see the <link> block below.
 */
const FONT_PRELOADS = ['/fonts/playfair-display-latin.woff2', '/fonts/inter-latin.woff2'] as const;

export const metadata: Metadata = {
  /** Makes every relative `alternates`/`openGraph` URL resolve absolutely. */
  metadataBase: new URL(site.url),

  title: {
    default: `${site.name} | Advocates & Legal Consultants`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,

  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  generator: 'Next.js',

  keywords: [
    'law firm',
    'advocates',
    'legal consultants',
    'corporate lawyer',
    'criminal lawyer',
    'family lawyer',
    'property lawyer',
    'divorce lawyer',
    'civil litigation',
    'arbitration',
    'legal consultation',
    site.address.city,
  ],

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Advocates & Legal Consultants`,
    description: site.description,
  },

  twitter: {
    card: 'summary_large_image',
    title: `${site.name} | Advocates & Legal Consultants`,
    description: site.description,
    creator: `@${site.social.twitterHandle}`,
    site: `@${site.social.twitterHandle}`,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  /**
   * `app/icon.png` and `app/apple-icon.png` are picked up automatically and
   * hashed for cache-busting, so no explicit `icons` block is needed. Drop a
   * `favicon.ico` into `app/` as well if you need to support legacy browsers.
   */

  category: 'Legal Services',
  formatDetection: { telephone: true, address: true, email: true },

  /**
   * Add your Search Console token via env to verify the property.
   * NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>
   */
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  colorScheme: 'light',
};

/**
 * `data-scroll-behavior="smooth"` on <html> is required because globals.css sets
 * `scroll-behavior: smooth` there. Next disables smooth scrolling for the
 * duration of a route transition — otherwise a client-side navigation animates
 * the scroll back to the top instead of jumping, which reads as lag. Next
 * currently sniffs the computed style to decide, but warns in the console that it
 * will stop doing so and rely on this attribute instead.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/*
        No explicit <head> element — React 19 hoists these <link>s into <head>
        on its own, and rendering one by hand used to suppress Next's automatic
        resource injection.

        Font preloads, by hand.

        The stylesheet is the only other thing that references these files, so
        without a preload the critical path to the hero copy — the LCP element —
        is HTML -> CSS -> font -> paint. Text cannot paint in its real face until
        that third hop lands, and Lighthouse costed it at 750ms of render-blocking
        delay against a 3.2s LCP. Naming the files here lets the browser start
        both fetches while the stylesheet is still in flight.

        These are stable paths under /public, not build hashes, precisely so this
        list cannot go stale silently. Keep it in step with the @font-face blocks
        in globals.css.

        `crossOrigin` is required even though these are same-origin: @font-face
        always fetches in CORS mode, and a preload whose mode does not match is
        ignored, which downloads the font twice instead of once.

        NO preconnect/dns-prefetch hints here — deliberately. They were tried for
        wa.me and maps.google.com and were worthless: nothing is fetched from
        wa.me until the user clicks, the Maps iframe is far below the fold, and
        Lighthouse flagged the preconnect as unused.
      */}
      {FONT_PRELOADS.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}

      <body className="min-h-screen antialiased">
        {/*
          Must run before the revealed content paints — see RevealReadyScript.
          As the first node in <body> it still executes before any [data-reveal]
          element below it is parsed, which is all the CSS needs.
        */}
        <RevealReadyScript />
        {/* Site-wide identity graph — emitted once, referenced by page-level schema. */}
        <JsonLd data={[organisationSchema(), websiteSchema()]} />

        <Navbar />

        <main id="main">{children}</main>

        <Footer />

        <WhatsAppButton />
        <BackToTop />
        <ToastProvider />
        <RevealObserver />
      </body>
    </html>
  );
}
