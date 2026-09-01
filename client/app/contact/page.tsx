import type { Metadata } from 'next';
import { GoogleMap } from '@/components/GoogleMap';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactSection } from '@/sections/ContactSection';
import { formattedAddress, site } from '@/content/site';
import { breadcrumbSchema } from '@/lib/jsonld';

const description = `Contact ${site.name} — ${formattedAddress}. Telephone ${site.phone.primary}, email ${site.email.general}. Book a confidential consultation in person, by video call or on WhatsApp.`;

export const metadata: Metadata = {
  title: 'Contact Us',
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    url: '/contact',
    title: `Contact ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact' },
];

export default function ContactPage() {
  return (
    <>
      {/* The LegalService/LocalBusiness node is emitted once in the root layout
          and applies site-wide, so this page only adds its breadcrumb trail. */}
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <PageBanner
        eyebrow="Contact"
        title="Book a confidential consultation"
        description="Tell us about your matter and we will respond within one working day with either an appointment slot or a request for the documents we need."
        breadcrumbs={breadcrumbs}
      />

      {/* The contact page supplies its own h1 in the banner, so the section
          heading steps down to h2. */}
      <ContactSection className="scroll-mt-24 py-20 lg:py-28" />

      {/* Map */}
      <section className="pb-20 lg:pb-28">
        <Container>
          <SectionHeading
            eyebrow="Find Us"
            title="Our offices"
            description="We sit at three chambers across East Delhi. Choose one below for its exact location, and please arrive a few minutes early so reception can show you through."
            align="left"
          />

          <Reveal className="mt-12">
            <GoogleMap />
          </Reveal>
        </Container>
      </section>

      {/* Urgent-matters notice */}
      <section className="border-t border-line bg-cream py-14">
        <Container size="narrow">
          <div className="text-center">
            <p className="eyebrow mb-5 justify-center">Urgent Matters</p>
            <h2 className="text-title">If someone has been arrested or detained</h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Do not use this form. Telephone{' '}
              <a
                href={`tel:${site.phone.primaryHref}`}
                className="font-semibold text-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-700 hover:decoration-gold"
              >
                {site.phone.primary}
              </a>{' '}
              and the call will reach our criminal practice partner, including outside working hours.
              The first few hours of a criminal matter often determine the rest of it.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
