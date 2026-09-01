import type { Metadata } from 'next';
import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/sections/CtaBanner';
import { practiceAreas } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema, serviceCatalogueSchema } from '@/lib/jsonld';

const description = `Twelve areas of legal practice — corporate, civil litigation, criminal defence, family, divorce, property, consumer protection, cheque bounce, arbitration, cyber, taxation and banking. ${site.name}.`;

export const metadata: Metadata = {
  title: 'Practice Areas',
  description,
  alternates: { canonical: '/practice-areas' },
  openGraph: {
    url: '/practice-areas',
    title: `Practice Areas | ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Practice Areas', href: '/practice-areas' },
];

export default function PracticeAreasPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), serviceCatalogueSchema(practiceAreas)]} />

      <PageBanner
        eyebrow="Practice Areas"
        title={`${practiceAreas.length} areas of law, one office`}
        description="Each area below is led by a partner who practises in it daily. Where a matter spans several — as commercial disputes usually do — those partners work it together rather than passing it along."
        breadcrumbs={breadcrumbs}
      />

      {/* Detailed sections, one per practice area */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Overview"
            title="Choose an area to see how we handle it"
            description="Each entry sets out what the area covers, the services within it, our process and what you get from instructing us."
          />

          <Stagger className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area) => (
              <StaggerItem key={area.slug} className="h-full">
                <Link
                  href={`/practice-areas/${area.slug}`}
                  className="group flex h-full flex-col bg-white p-8 transition-colors duration-500 ease-luxe hover:bg-ink"
                >
                  <span className="mb-6 inline-flex h-12 w-12 items-center justify-center border border-line text-gold-600 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <Icon name={area.icon} className="h-6 w-6" />
                  </span>

                  <h3 className="font-display text-lg leading-snug transition-colors duration-500 group-hover:text-white">
                    {area.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/60">
                    {area.tagline}
                  </p>

                  <ul className="mt-5 space-y-1.5">
                    {area.servicesOffered.slice(0, 3).map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-xs leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/45"
                      >
                        <span className="text-gold" aria-hidden="true">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-6 inline-flex items-center gap-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 group-hover:text-gold">
                    Full details
                    <TbArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Cross-practice note */}
      <section className="bg-stone py-16 lg:py-20">
        <Container size="narrow">
          <Reveal className="text-center">
            <p className="eyebrow mb-5 justify-center">Cross-Practice Matters</p>
            <h2 className="text-title">Most real disputes do not respect these categories</h2>
            <p className="mt-6 text-base leading-relaxed text-muted">
              A dishonoured cheque brings a criminal complaint, a recovery suit and a contract
              question at once. A stalled purchase raises property, consumer and banking issues
              together. When a matter spans areas, the relevant partners run it jointly — and you
              still deal with one of them.
            </p>
          </Reveal>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
