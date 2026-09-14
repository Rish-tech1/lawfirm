import type { Metadata } from 'next';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/ui/JsonLd';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/sections/CtaBanner';
import { PracticeAreasPreview } from '@/sections/PracticeAreasPreview';
import { practiceAreas, services } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema, serviceCatalogueSchema } from '@/lib/jsonld';

const description =
  'Comprehensive legal services in Delhi NCR — litigation and court representation, legal notices, contract drafting, title due diligence, corporate compliance and NRI consultation by top advocates at Singla & Singla.';

export const metadata: Metadata = {
  title: 'Legal Services in Delhi NCR | Top Advocates & Legal Consultants',
  description,
  alternates: { canonical: '/services' },
  openGraph: {
    url: '/services',
    title: `Legal Services in Delhi NCR | ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), serviceCatalogueSchema(practiceAreas)]} />

      <PageBanner
        eyebrow="Our Services"
        title="How we work with you"
        description="Practice areas describe the law we know. These are the ways we actually help — from a single written opinion to conduct of a matter from notice through to enforcement."
        breadcrumbs={breadcrumbs}
      />

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="What We Offer"
            title="Eight ways to engage the firm"
            description="Every engagement begins with a written scope and a fee basis, so you know what you are buying before we begin."
          />

          <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <StaggerItem key={service.slug} className="h-full">
                <ServiceCard service={service} priority={index < 3} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <PracticeAreasPreview />

      <CtaBanner
        title="Not sure which service you need?"
        description="Describe your situation and we will tell you what is actually required — which is sometimes less than you expected."
      />
    </>
  );
}
