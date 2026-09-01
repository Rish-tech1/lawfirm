import type { Metadata } from 'next';
import { PageBanner } from '@/components/layout/PageBanner';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBanner } from '@/sections/CtaBanner';
import { faqCategories, faqs } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema, faqPageSchema } from '@/lib/jsonld';

const description =
  'Answers to common questions about booking a consultation, required documents, online consultation, fees, timelines, confidentiality and how matters are handled.';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description,
  alternates: { canonical: '/faq' },
  openGraph: {
    url: '/faq',
    title: `Frequently Asked Questions | ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'FAQ', href: '/faq' },
];

export default function FaqPage() {
  return (
    <>
      {/* FAQPage schema covers every question on the page, not just the previewed ones. */}
      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqPageSchema(faqs)]} />

      <PageBanner
        eyebrow="FAQ"
        title="Questions clients ask us"
        description="If your question is not answered below, ask it directly. We would rather answer it before you engage us than after."
        breadcrumbs={breadcrumbs}
      >
        {/* Anchor links double as an in-page table of contents. */}
        <nav aria-label="FAQ categories">
          <ul className="flex flex-wrap gap-2.5">
            {faqCategories.map((category) => (
              <li key={category}>
                <a
                  href={`#${category.toLowerCase()}`}
                  className="inline-flex border border-white/20 px-4 py-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-gold hover:text-gold-300"
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageBanner>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <p className="eyebrow mb-5">Still Unsure?</p>
                  <h2 className="text-title">Ask us the question directly</h2>
                  <p className="mt-5 text-sm leading-relaxed text-muted">
                    Enquiries are acknowledged immediately and answered within one working day. For
                    arrest, detention or search matters, telephone the office rather than using the
                    form.
                  </p>

                  <div className="mt-7 flex flex-col gap-3">
                    <Button href="/contact" variant="dark" size="md">
                      Ask a Question
                    </Button>
                    <Button href={`tel:${site.phone.primaryHref}`} variant="outline" size="md">
                      {site.phone.primary}
                    </Button>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Grouped questions */}
            <div className="space-y-14 lg:col-span-8">
              {faqCategories.map((category) => {
                const items = faqs.filter((faq) => faq.category === category);

                return (
                  <div key={category} id={category.toLowerCase()} className="scroll-mt-32">
                    <Reveal>
                      <h2 className="font-display text-2xl">{category}</h2>
                      <div className="rule-gold mt-4" aria-hidden="true" />
                    </Reveal>

                    <Reveal delay={0.06} className="mt-7">
                      <Accordion
                        items={items.map((faq) => ({
                          id: faq.id,
                          question: faq.question,
                          answer: faq.answer,
                        }))}
                        defaultOpen={null}
                        allowMultiple
                      />
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
