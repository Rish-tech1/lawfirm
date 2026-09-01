import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TbArrowRight, TbCheck } from 'react-icons/tb';
import { PageBanner } from '@/components/layout/PageBanner';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactSection } from '@/sections/ContactSection';
import { getPracticeArea, practiceAreas } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema, practiceAreaSchema } from '@/lib/jsonld';

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

  /** Three sibling areas for internal linking, wrapping around the list. */
  const currentIndex = practiceAreas.findIndex((item) => item.slug === area.slug);
  const related = [1, 2, 3].map(
    (offset) => practiceAreas[(currentIndex + offset) % practiceAreas.length]!,
  );

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), practiceAreaSchema(area)]} />

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

      {/* Related areas — internal linking */}
      <section className="bg-stone py-20 lg:py-28">
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
