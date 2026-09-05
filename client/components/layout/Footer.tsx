import Link from 'next/link';
import {
  TbBrandFacebook,
  TbBrandInstagram,
  TbBrandLinkedin,
  TbBrandX,
  TbClock,
  TbMail,
  TbMapPin,
  TbPhone,
} from 'react-icons/tb';
import { Container } from '@/components/ui/Container';
import { Logo } from './Logo';
import { formattedAddress, mainNav, site } from '@/content/site';
import { practiceAreas, services } from '@/content';

/**
 * All four profiles are listed; the ones the firm does not have are `null` in
 * site.ts and drop out here. Adding a real URL there lights up the icon *and*
 * adds it to `sameAs` in the organisation schema, which is the half that
 * actually matters for search.
 *
 * The predicate narrows rather than just filtering: a plain `Boolean(...)`
 * filter leaves `href` typed `string | null`, which is how three invented
 * profile URLs stayed compilable in the first place.
 */
const socialLinks = [
  { href: site.social.linkedin, label: 'LinkedIn', Icon: TbBrandLinkedin },
  { href: site.social.facebook, label: 'Facebook', Icon: TbBrandFacebook },
  { href: site.social.twitter, label: 'X', Icon: TbBrandX },
  { href: site.social.instagram, label: 'Instagram', Icon: TbBrandInstagram },
].filter((link): link is typeof link & { href: string } => Boolean(link.href));

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink texture-dark text-white/70">
      <Container>
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Identity */}
          <div className="lg:col-span-4">
            <Logo tone="light" />

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              A full-service legal practice advising individuals, families and businesses across
              twelve areas of law since {site.foundingYear}. Candid advice first; litigation where
              it genuinely serves you.
            </p>

            {socialLinks.length > 0 ? (
              <ul className="mt-8 flex items-center gap-2.5">
                {socialLinks.map(({ href, label, Icon: Glyph }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.shortName} on ${label} (opens in a new tab)`}
                      className="grid h-10 w-10 place-items-center border border-white/15 text-white/70 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                    >
                      <Glyph className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Navigation */}
          <nav className="lg:col-span-2" aria-labelledby="footer-explore">
            <h2
              id="footer-explore"
              className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Explore
            </h2>
            <ul className="mt-6 space-y-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="link-underline text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Practice areas — internal linking for SEO as well as navigation. */}
          <nav className="lg:col-span-3" aria-labelledby="footer-practice">
            <h2
              id="footer-practice"
              className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold"
            >
              Practice Areas
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {practiceAreas.slice(0, 8).map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/practice-areas/${area.slug}`}
                    prefetch={false}
                    className="link-underline text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {area.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/practice-areas"
                  prefetch={false}
                  className="link-underline text-sm font-medium text-gold-300 transition-colors hover:text-gold"
                >
                  View all {practiceAreas.length} areas →
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
              Contact
            </h2>

            <address className="mt-6 space-y-4 text-sm not-italic">
              <p className="flex gap-3 text-white/60">
                <TbMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <span>{formattedAddress}</span>
              </p>

              <p className="flex gap-3">
                <TbPhone className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <span className="flex flex-col gap-1">
                  <a
                    href={`tel:${site.phone.primaryHref}`}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {site.phone.primary}
                  </a>
                  <a
                    href={`tel:${site.phone.secondaryHref}`}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {site.phone.secondary}
                  </a>
                </span>
              </p>

              <p className="flex gap-3">
                <TbMail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <a
                  href={`mailto:${site.email.general}`}
                  className="break-all text-white/60 transition-colors hover:text-white"
                >
                  {site.email.general}
                </a>
              </p>

              <div className="flex gap-3">
                <TbClock className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <ul className="space-y-1 text-white/60">
                  {site.hours.map((slot) => (
                    <li key={slot.days}>
                      <span className="text-white/80">{slot.days}</span>
                      <br />
                      {slot.time}
                    </li>
                  ))}
                </ul>
              </div>
            </address>
          </div>
        </div>

        {/* Services strip — secondary internal links. */}
        <div className="border-t border-white/[0.08] py-8">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href="/services"
                  prefetch={false}
                  className="text-xs text-white/45 transition-colors hover:text-gold-300"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colophon */}
        <div className="border-t border-white/[0.08] py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/40">
              © {year} {site.name}. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              {site.tagline}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
