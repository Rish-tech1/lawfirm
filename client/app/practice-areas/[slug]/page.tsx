import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TbArrowRight, TbCheck } from 'react-icons/tb';
import { PageBanner } from '@/components/layout/PageBanner';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactSection } from '@/sections/ContactSection';
import { getPracticeArea, practiceAreas } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema, faqPageSchema, practiceAreaSchema } from '@/lib/jsonld';
import { cn } from '@/lib/utils';
import type { PracticeArea } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renders every practice area at build time, so each is a static HTML file
 * served from the edge — fast for users and cheap to crawl.
 */
export function generateStaticParams() {
  return practiceAreas.map((area) => ({ slug: area.slug }));
}

/** Unknown slugs 404 rather than rendering an empty shell. */
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) {
    return { title: 'Practice Area Not Found' };
  }

  const canonical = `/practice-areas/${area.slug}`;

  return {
    title: area.title,
    description: area.metaDescription,
    keywords: area.keywords,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: `${area.title} | ${site.shortName}`,
      description: area.metaDescription,
      type: 'article',
    },
    twitter: {
      title: `${area.title} | ${site.shortName}`,
      description: area.metaDescription,
    },
  };
}

export default async function PracticeAreaPage({ params }: PageProps) {
  const { slug } = await params;
  const area = getPracticeArea(slug);

  if (!area) notFound();

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Practice Areas', href: '/practice-areas' },
    { name: area.title, href: `/practice-areas/${area.slug}` },
  ];

  /**
   * Sibling areas for internal linking.
   *
   * Prefers the area's declared `related` slugs, because a link between two
   * genuinely adjacent areas — cheque bounce to banking law — passes topical
   * relevance, while a link chosen by array position does not. Falls back to
   * the next three entries in the file for areas that have not declared any,
   * so the block is never empty. Unknown slugs are dropped rather than
   * rendering a dead card.
   */
  const currentIndex = practiceAreas.findIndex((item) => item.slug === area.slug);
  const declared = (area.related ?? [])
    .map((slug) => getPracticeArea(slug))
    .filter((item): item is PracticeArea => Boolean(item) && item!.slug !== area.slug);

  const related =
    declared.length > 0
      ? declared
      : [1, 2, 3].map((offset) => practiceAreas[(currentIndex + offset) % practiceAreas.length]!);

  /**
   * The optional depth sections that this area actually declares, in render
   * order. Their backgrounds alternate across whichever are present rather than
   * being hardcoded, because an area declaring only one of the three would
   * otherwise sit flush against a same-coloured neighbour and read as one
   * undifferentiated block.
   */
  const depthSections = (['keyLaws', 'courts', 'faqs'] as const).filter(
    (key) => (area[key]?.length ?? 0) > 0,
  );

  /** Benefits, immediately above, is white — so the first present section is stone. */
  const depthBg = (key: (typeof depthSections)[number]) =>
    depthSections.indexOf(key) % 2 === 0 ? 'bg-stone' : '';

  const relatedBg = depthSections.length % 2 === 0 ? 'bg-stone' : '';

  return (
    <>
      {/*
        FAQPage is emitted per area rather than only on /faq, so each area page
        carries the questions that belong to it. This is what makes the answers
        eligible to render as expandable rows beneath the result.
      */}
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          practiceAreaSchema(area),
          ...(area.faqs?.length ? [faqPageSchema(area.faqs)] : []),
        ]}
      />

      <PageBanner
        eyebrow="Practice Area"
        title={area.title}
        description={area.tagline}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            href="#contact"
            variant="primary"
            size="lg"
            icon={
              <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            }
          >
            Discuss Your Matter
          </Button>
          <Button href={`tel:${site.phone.primaryHref}`} variant="outlineLight" size="lg">
            {site.phone.primary}
          </Button>
        </div>
      </PageBanner>

      {/* Overview */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <span
                className="inline-flex h-14 w-14 items-center justify-center border border-gold/40 text-gold-600"
                aria-hidden="true"
              >
                <Icon name={area.icon} className="h-7 w-7" />
              </span>

              <p className="eyebrow mb-5 mt-7">Overview</p>
              <h2 className="text-display">What this area covers</h2>
              <div className="rule-gold mt-6" aria-hidden="true" />
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-7">
              <div className="prose-legal text-base">
                {area.overview.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Services offered */}
      <section className="bg-stone py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Services Offered"
            title={`What we handle within ${area.title.toLowerCase()}`}
            align="left"
          />

          <Stagger className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {area.servicesOffered.map((item, index) => (
              <StaggerItem key={item} className="h-full">
                <div className="flex h-full items-start gap-4 bg-white p-7">
                  <span className="font-display text-2xl leading-none text-gold/50" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-ink">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Process */}
      <section className="bg-ink texture-dark py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Our Process"
            title="How a matter proceeds"
            description="Four stages, each with a defined output — so you always know what has happened and what comes next."
            tone="light"
          />

          <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {area.process.map((step) => (
              <StaggerItem key={step.step}>
                <div className="relative border-t-2 border-gold/30 pt-7 transition-colors duration-500 hover:border-gold">
                  <span className="font-display text-5xl leading-none text-gold/25" aria-hidden="true">
                    {String(step.step).padStart(2, '0')}
                  </span>

                  <h3 className="mt-5 font-display text-lg text-white">{step.title}</h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/60">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow mb-5">Benefits</p>
              <h2 className="text-display">What instructing us gets you</h2>
              <div className="rule-gold mt-6" aria-hidden="true" />
              <p className="mt-7 text-base leading-relaxed text-muted">
                These are commitments, not aspirations. If we fail one of them on your matter, tell
                the partner handling it.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-7">
              <ul className="divide-y divide-line border-y border-line">
                {area.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-4 py-6">
                    <span
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-700"
                      aria-hidden="true"
                    >
                      <TbCheck className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-base leading-relaxed text-ink">{benefit}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/*
        Statutes. Renders only when the area declares them — an area with no
        `keyLaws` looks exactly as it did before this section existed.
      */}
      {area.keyLaws?.length ? (
        <section className={cn('py-20 lg:py-28', depthBg('keyLaws'))}>
          <Container>
            <SectionHeading
              eyebrow="Governing Law"
              title="The statutes this work runs on"
              description="The primary legislation we act under in this area. Links go to the bare Act."
              align="left"
            />

            <Stagger className="mt-14 grid gap-px bg-line sm:grid-cols-2">
              {area.keyLaws.map((law) => (
                <StaggerItem key={law.name} className="h-full">
                  <div className="flex h-full flex-col bg-white p-8">
                    <h3 className="font-display text-lg leading-snug text-ink">
                      {law.url ? (
                        <a
                          href={law.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-gold-700"
                        >
                          {law.name}
                        </a>
                      ) : (
                        law.name
                      )}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-muted">{law.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      ) : null}

      {/* Courts — carries local intent onto every area page. */}
      {area.courts?.length ? (
        <section className={cn('py-20 lg:py-28', depthBg('courts'))}>
          <Container>
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-5">
                <p className="eyebrow mb-5">Where We Appear</p>
                <h2 className="text-display">Courts and tribunals</h2>
                <div className="rule-gold mt-6" aria-hidden="true" />
                <p className="mt-7 text-base leading-relaxed text-muted">
                  We conduct {area.title.toLowerCase()} matters before the forums below, across{' '}
                  {site.areaServed.slice(0, -1).join(', ')} and {site.areaServed.at(-1)}.
                </p>
              </Reveal>

              <Reveal delay={0.08} className="lg:col-span-7">
                <ul className="flex flex-wrap gap-3">
                  {area.courts.map((court) => (
                    <li
                      key={court}
                      className="border border-line bg-white px-5 py-3 text-sm font-medium text-ink"
                    >
                      {court}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>
      ) : null}

      {/*
        Per-area FAQs. The accordion keeps collapsed answers mounted and
        height-collapsed, so every answer is in the served HTML for crawlers
        whether or not the panel is open.
      */}
      {area.faqs?.length ? (
        <section className={cn('py-20 lg:py-28', depthBg('faqs'))}>
          <Container>
            <SectionHeading
              eyebrow="Common Questions"
              title={`${area.title} — questions we are asked`}
              align="left"
            />

            <Reveal className="mt-14">
              <Accordion
                items={area.faqs.map((faq, index) => ({
                  id: `${area.slug}-faq-${index}`,
                  question: faq.question,
                  answer: faq.answer,
                }))}
                defaultOpen={null}
                className="max-w-4xl"
              />
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Related areas — internal linking */}
      <section className={cn('py-20 lg:py-28', relatedBg)}>
        <Container>
          <SectionHeading eyebrow="Related" title="Other areas we practise in" align="left" />

          <Stagger className="mt-14 grid gap-px bg-line sm:grid-cols-3">
            {related.map((item) => (
              <StaggerItem key={item.slug} className="h-full">
                <Link
                  href={`/practice-areas/${item.slug}`}
                  className="group flex h-full flex-col bg-white p-8 transition-colors duration-500 hover:bg-ink"
                >
                  <span className="mb-5 inline-flex h-11 w-11 items-center justify-center border border-line text-gold-600 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>

                  <h3 className="font-display text-lg transition-colors duration-500 group-hover:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/60">
                    {item.tagline}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 group-hover:text-gold">
                    Learn more
                    <TbArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Practice-area-specific enquiry form */}
      <ContactSection defaultPracticeArea={area.title} />
    </>
  );
}
