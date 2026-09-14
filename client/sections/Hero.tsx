import type { CSSProperties } from 'react';
import { TbArrowRight, TbPhone } from 'react-icons/tb';
import { HeroBackdrop } from '@/components/art/HeroBackdrop';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { site } from '@/content/site';
import { advocates, practiceAreas } from '@/content';

/**
 * Home-page hero.
 *
 * A server component that ships no JavaScript. Two decisions here exist purely
 * to protect Largest Contentful Paint:
 *
 *  1. The entrance uses `.reveal-on-load` (a CSS animation that starts with the
 *     page) rather than the scroll-reveal `Reveal` component. An
 *     IntersectionObserver cannot run until hydration, so gating the largest
 *     text on it delayed LCP by well over two seconds.
 *  2. The `h1` carries no delay at all, so the LCP candidate paints on the first
 *     frame. Only the surrounding elements are staggered.
 *
 * The backdrop is inline SVG for the same reason — no extra round trip.
 */

/** `--reveal-delay` is consumed by the `.reveal-on-load` class. */
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

export function Hero() {
  const yearsInPractice = new Date().getFullYear() - site.foundingYear;

  return (
    <section className="relative isolate flex min-h-[42rem] items-center overflow-hidden bg-ink lg:min-h-[46rem]">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <HeroBackdrop />
        {/* Twin gradients: horizontal for text contrast, vertical for depth. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60"
          aria-hidden="true"
        />
      </div>

      <Container className="relative py-28 lg:py-32">
        <div className="max-w-3xl">
          <div className="reveal-on-load flex flex-wrap items-center gap-2 text-gold-300" style={delay(60)}>
            <span className="eyebrow text-gold-300">
              Top Law Firm in Delhi NCR · Since {site.foundingYear}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-gold/60 sm:inline-block" aria-hidden="true" />
            <span className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-white/60">
              Chamber F-622, Karkardooma Court
            </span>
          </div>

          <h1 className="mt-7 text-hero text-white">
            Justice. Integrity.
            <br />
            <span className="text-gold-gradient">Excellence.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Ranked among the <strong className="font-semibold text-white">top law firms in Delhi NCR</strong>.
            With over 28 years of courtroom excellence from our principal chambers at Karkardooma Court,
            our seasoned advocates provide direct counsel across {practiceAreas.length} practice areas before the
            Supreme Court of India, Delhi High Court, and all Delhi District Courts.
          </p>

          {/* Court jurisdiction tags */}
          <div className="reveal-on-load mt-6 flex flex-wrap gap-2" style={delay(140)}>
            {[
              'Karkardooma Court',
              'Delhi High Court',
              'Supreme Court of India',
              'Tis Hazari Courts',
              'Saket Courts',
              'Patiala House',
            ].map((court) => (
              <span
                key={court}
                className="inline-flex items-center border border-white/15 bg-white/5 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-white/70 backdrop-blur-xs"
              >
                {court}
              </span>
            ))}
          </div>

          <div
            className="reveal-on-load mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={delay(220)}
          >
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              icon={
                <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              }
            >
              Book Consultation
            </Button>

            <Button
              href={`tel:${site.phone.primaryHref}`}
              variant="outlineLight"
              size="lg"
              icon={<TbPhone className="h-4 w-4" />}
              aria-label={`Call Now on ${site.phone.primary}`}
            >
              Call Now: {site.phone.primary}
            </Button>
          </div>

          {/* Trust strip */}
          <dl
            className="reveal-on-load mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8"
            style={delay(300)}
          >
            <div className="flex flex-col">
              <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/45">
                Years in practice
              </dt>
              <dd className="order-first font-display text-3xl text-gold">{yearsInPractice}+</dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/45">
                Practice areas
              </dt>
              <dd className="order-first font-display text-3xl text-gold">
                {practiceAreas.length}
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/45">
                Advocates & Counsel
              </dt>
              <dd className="order-first font-display text-3xl text-gold">{advocates.length}</dd>
            </div>
          </dl>
        </div>
      </Container>

      {/* Scroll cue */}
      <div
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        aria-hidden="true"
      >
        <span className="text-[0.625rem] uppercase tracking-[0.28em] text-white/35">Scroll</span>
        <span className="h-12 w-px overflow-hidden bg-white/15">
          <span className="block h-full w-full origin-top bg-gold motion-safe:animate-shimmer" />
        </span>
      </div>
    </section>
  );
}
