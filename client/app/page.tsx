import type { Metadata } from 'next';
import { JsonLd } from '@/components/ui/JsonLd';
import { AboutPreview } from '@/sections/AboutPreview';
import { ContactSection } from '@/sections/ContactSection';
import { CtaBanner } from '@/sections/CtaBanner';
import { FaqPreview } from '@/sections/FaqPreview';
import { Hero } from '@/sections/Hero';
import { PracticeAreasPreview } from '@/sections/PracticeAreasPreview';
import { Stats } from '@/sections/Stats';
import { TeamPreview } from '@/sections/TeamPreview';
import { TestimonialsSlider } from '@/sections/TestimonialsSlider';
import { WhyChooseUs } from '@/sections/WhyChooseUs';
import { featuredFaqs, practiceAreas, testimonials } from '@/content';
import { showTestimonials, site } from '@/content/site';
import { faqPageSchema, serviceCatalogueSchema } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: `${site.name} | Advocates & Legal Consultants in ${site.address.city}`,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: `${site.name} | Advocates & Legal Consultants`,
    description: site.description,
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[serviceCatalogueSchema(practiceAreas), faqPageSchema(featuredFaqs)]}
      />

      <Hero />
      <Stats />
      <AboutPreview />
      <PracticeAreasPreview limit={6} />
      <WhyChooseUs />
      {showTestimonials ? <TestimonialsSlider testimonials={testimonials} /> : null}
      <TeamPreview />
      <CtaBanner />
      <FaqPreview />
      <ContactSection />
    </>
  );
}
