import type { Metadata } from 'next';
import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { featuredPracticeAreas, mainNav } from '@/content';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description:
    'The page you were looking for could not be found. Browse our practice areas or contact the firm directly.',
  robots: { index: false, follow: true },
};

/**
 * Custom 404.
 *
 * Rather than a dead end, it offers the routes people actually arrive looking
 * for — practice areas, the main navigation, and a direct line to the office.
 */
export default function NotFound() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink texture-dark pb-20 pt-36 lg:pb-28 lg:pt-48">
        <Container>
          <div className="max-w-3xl">
            <p className="font-display text-[6rem] leading-none text-gold/25 sm:text-[8rem]">404</p>

            <h1 className="mt-4 text-display text-white">This page could not be found</h1>

            <div className="rule-gold mt-7" aria-hidden="true" />

            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              The link may be out of date, or the page may have moved. Everything on the site is
              reachable from the links below — or call the office and we will point you to it.
            </p>

            <div className="mt-11 flex flex-col gap-4 sm:flex-row">
              <Button
                href="/"
                variant="primary"
                size="lg"
                icon={
                  <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                }
              >
                Back to Home
              </Button>

              <Button href="/contact" variant="outlineLight" size="lg">
                Contact the Firm
              </Button>
            </div>

            <nav className="mt-14 border-t border-white/10 pt-8" aria-label="Site sections">
              <p className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
                All Pages
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </section>

      {/* Practice areas as a recovery path */}
      <section className="py-20 lg:py-24">
        <Container>
          <h2 className="font-display text-2xl">Looking for a particular practice area?</h2>
          <div className="rule-gold mt-4" aria-hidden="true" />

          <ul className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {featuredPracticeAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/practice-areas/${area.slug}`}
                  className="group flex items-center gap-4 bg-white p-6 transition-colors hover:bg-cream"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center border border-line text-gold-600 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                    aria-hidden="true"
                  >
                    <Icon name={area.icon} className="h-5 w-5" />
                  </span>

                  <span className="font-body text-sm font-medium text-ink">{area.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-muted">
            Or telephone{' '}
            <a
              href={`tel:${site.phone.primaryHref}`}
              className="font-medium text-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-700 hover:decoration-gold"
            >
              {site.phone.primary}
            </a>{' '}
            during office hours.
          </p>
        </Container>
      </section>
    </>
  );
}
