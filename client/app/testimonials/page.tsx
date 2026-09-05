import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StarRating } from '@/components/ui/StarRating';
import { CtaBanner } from '@/sections/CtaBanner';
import { testimonials } from '@/content';
import { showTestimonials, site } from '@/content/site';
import { breadcrumbSchema, reviewSchema } from '@/lib/jsonld';

const description = `Client testimonials and success stories from matters handled by ${site.name} across corporate, family, property, consumer, banking, criminal, cyber and cheque bounce matters.`;

export const metadata: Metadata = {
  title: 'Client Testimonials',
  description,
  alternates: { canonical: '/testimonials' },
  openGraph: {
    url: '/testimonials',
    title: `Client Testimonials | ${site.name}`,
    description,
  },
  /**
   * Belt and braces alongside the `notFound()` below. If the page is switched
   * off after having been indexed, a crawler holding the old URL gets an
   * explicit noindex as well as a 404, which drops it from results faster than
   * the 404 alone.
   */
  ...(showTestimonials ? {} : { robots: { index: false, follow: false } }),
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Testimonials', href: '/testimonials' },
];

export default function TestimonialsPage() {
  /**
   * Switched off via NEXT_PUBLIC_SHOW_TESTIMONIALS=false — see the note on
   * `showTestimonials` in content/site.ts. Rendering the 404 rather than an
   * empty page means the route is genuinely gone: no thin page for a crawler
   * to index, and no `Review` structured data emitted for invented clients.
   */
  if (!showTestimonials) notFound();

  const averageRating =
    testimonials.reduce((total, item) => total + item.rating, 0) / testimonials.length;

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), reviewSchema(testimonials)]} />

      <PageBanner
        eyebrow="Testimonials"
        title="In our clients' words"
        description="Outcomes matter, but so does the experience of being represented. These accounts cover both — including the advice clients did not initially want to hear."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(averageRating)} size="md" />
            <span className="font-display text-2xl text-white">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-white/50">average rating</span>
          </div>

          <div className="h-8 w-px bg-white/15" aria-hidden="true" />

          <p className="text-xs text-white/50">
            <span className="font-display text-2xl text-white">{testimonials.length}</span> published
            accounts
          </p>
        </div>
      </PageBanner>

      {/* Quote grid */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Client Reviews"
            title="What clients say"
            description="Published with written consent. Names and details appear only where the client agreed to them."
          />

          <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.id} className="h-full">
                <TestimonialCard testimonial={testimonial} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Success stories */}
      <section className="bg-stone py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Success Stories"
            title="The matters behind the quotes"
            description="Fuller accounts of how these matters were actually run, in the clients' own words."
          />

          <div className="mt-16 space-y-8">
            {testimonials
              .filter((testimonial) => testimonial.successStory)
              .map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={index * 0.04}>
                  <TestimonialCard testimonial={testimonial} variant="story" />
                </Reveal>
              ))}
          </div>
        </Container>
      </section>

      {/* Regulatory note — testimonials are restricted for advocates in some jurisdictions. */}
      <section className="py-14">
        <Container size="narrow">
          <p className="border-l-2 border-gold/40 pl-5 text-xs leading-relaxed text-muted">
            <strong className="font-semibold text-ink">Please note:</strong> the accounts on this
            page are published with client consent and describe past matters only. Past results do
            not guarantee or predict a similar outcome in any future matter, and nothing here should
            be read as a promise of results. Every case turns on its own facts.
          </p>
        </Container>
      </section>

      <CtaBanner
        title="Become our next satisfied client"
        description="Book a consultation and get a candid assessment of your position — including whether litigation is the right route at all."
      />
    </>
  );
}
