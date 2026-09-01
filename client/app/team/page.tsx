import type { Metadata } from 'next';
import { TeamCard } from '@/components/cards/TeamCard';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/ui/JsonLd';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/sections/CtaBanner';
import { team } from '@/content';
import { site } from '@/content/site';
import { attorneyListSchema, breadcrumbSchema } from '@/lib/jsonld';

const description = `Meet the advocates at ${site.name} — partners and associates practising in corporate, civil, criminal, family, property, banking and taxation law. Qualifications, experience and direct contact details.`;

export const metadata: Metadata = {
  title: 'Our Team',
  description,
  alternates: { canonical: '/team' },
  openGraph: {
    url: '/team',
    title: `Our Team | ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Team', href: '/team' },
];

export default function TeamPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), attorneyListSchema(team)]} />

      <PageBanner
        eyebrow="Our Team"
        title="The advocates behind the practice"
        description="The advocates and associates who run this practice day to day. The partner who takes your consultation is the one who appears in your matter."
        breadcrumbs={breadcrumbs}
      />

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Partners & Associates"
            title="Who you will be working with"
            description="Tell us what your matter concerns and we will route your enquiry to the partner who practises in it."
          />

          <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <StaggerItem key={member.slug} className="h-full">
                <TeamCard member={member} priority={index < 3} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Recruitment note */}
      <section className="bg-stone py-16 lg:py-20">
        <Container size="narrow">
          <div className="text-center">
            <p className="eyebrow mb-5 justify-center">Join Us</p>
            <h2 className="text-title">Interested in practising with this firm?</h2>
            <p className="mt-6 text-base leading-relaxed text-muted">
              We take on a small number of associates and interns each year, and we look for the
              same quality we promise clients: the willingness to give an honest answer rather than a
              comfortable one. Send your CV and a short note to{' '}
              <a
                href={`mailto:${site.email.general}`}
                className="font-medium text-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-700 hover:decoration-gold"
              >
                {site.email.general}
              </a>
              .
            </p>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Speak to the right advocate"
        description="Tell us briefly what your matter concerns and we will route your enquiry to the partner who practises in it."
      />
    </>
  );
}
