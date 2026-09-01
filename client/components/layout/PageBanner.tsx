import type { CSSProperties, ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';

interface PageBannerProps {
  eyebrow?: string;
  /** Rendered as the page's single `h1`. */
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  children?: ReactNode;
}

/** `--reveal-delay` is consumed by the `.reveal-on-load` class. */
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/**
 * Shared banner for every inner page.
 *
 * Carries the page `h1` and the visible breadcrumb trail, and reserves the fixed
 * navbar's height in padding.
 *
 * Uses `.reveal-on-load` rather than the scroll-reveal `Reveal` component for
 * the same reason as `Hero`: this content is above the fold on every inner page,
 * and the `h1` is the Largest Contentful Paint candidate. A scroll observer
 * cannot fire until hydration, which would hold the heading invisible until then.
 * The heading itself takes no delay so it paints on the first frame.
 */
export function PageBanner({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageBannerProps) {
  return (
    <section className="relative overflow-hidden bg-ink texture-dark pb-16 pt-32 lg:pb-20 lg:pt-44">
      {/* Faint gold hairlines for depth; purely decorative. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 119px, #C8A75B 119px, #C8A75B 120px)',
        }}
      />

      <Container className="relative">
        <Breadcrumbs items={breadcrumbs} tone="light" className="reveal-on-load mb-8" />

        {eyebrow ? (
          <p className="eyebrow reveal-on-load mb-5 text-gold-300" style={delay(60)}>
            {eyebrow}
          </p>
        ) : null}

        <h1 className="reveal-on-load max-w-4xl text-display text-white">{title}</h1>

        <div className="rule-gold reveal-on-load mt-7" style={delay(140)} aria-hidden="true" />

        {description ? (
          <p
            className="reveal-on-load mt-7 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
            style={delay(180)}
          >
            {description}
          </p>
        ) : null}

        {children ? (
          <div className="reveal-on-load mt-10" style={delay(260)}>
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
