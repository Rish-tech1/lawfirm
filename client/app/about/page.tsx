import type { Metadata } from 'next';
import Image from 'next/image';
import { TbQuote } from 'react-icons/tb';
import { FeatureCard } from '@/components/cards/FeatureCard';
import { PageBanner } from '@/components/layout/PageBanner';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBanner } from '@/sections/CtaBanner';
import { Stats } from '@/sections/Stats';
import { firm, gallery, timeline } from '@/content';
import { site } from '@/content/site';
import { breadcrumbSchema } from '@/lib/jsonld';

const description = `Founded in ${site.foundingYear}, ${site.name} is a full-service legal practice built on candid advice. Read about our history, mission, values and the founder's approach.`;

export const metadata: Metadata = {
  title: 'About the Firm',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    url: '/about',
    title: `About ${site.name}`,
    description,
  },
};

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <PageBanner
        eyebrow="About Us"
        title="A practice built on telling clients what they need to hear"
        description={`Established in ${site.foundingYear}, we advise individuals, families and businesses across twelve areas of law — and we are as direct about what we cannot do as about what we can.`}
        breadcrumbs={breadcrumbs}
      />

      <Stats />

      {/* Introduction */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow mb-5">Who We Are</p>
              <h2 className="text-display">
                Full-service counsel, <span className="text-gold-gradient">single point of contact</span>
              </h2>
              <div className="rule-gold mt-6" aria-hidden="true" />
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-7">
              <div className="prose-legal text-base">
                {firm.introduction.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Mission & vision */}
      <section className="bg-ink texture-dark py-20 lg:py-28">
        <Container>
          <div className="grid gap-px bg-white/[0.08] lg:grid-cols-2">
            <div className="bg-ink-800 p-10 lg:p-14">
              <span
                className="inline-flex h-12 w-12 items-center justify-center border border-gold/40 text-gold"
                aria-hidden="true"
              >
                <Icon name="target" className="h-6 w-6" />
              </span>
              <h2 className="mt-7 font-display text-2xl text-white">Our Mission</h2>
              <p className="mt-5 text-base leading-relaxed text-white/65">{firm.mission}</p>
            </div>

            <div className="bg-ink-800 p-10 lg:p-14">
              <span
                className="inline-flex h-12 w-12 items-center justify-center border border-gold/40 text-gold"
                aria-hidden="true"
              >
                <Icon name="award" className="h-6 w-6" />
              </span>
              <h2 className="mt-7 font-display text-2xl text-white">Our Vision</h2>
              <p className="mt-5 text-base leading-relaxed text-white/65">{firm.vision}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* History */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal direction="right">
              <div className="relative aspect-[16/9] overflow-hidden bg-stone">
                <Image
                  src="/images/about-chambers.jpg"
                  alt="The firm's chambers: panelled walls with the Singla &amp; Singla plaque above the fireplace, bound law reports on the shelves and the partner's desk beyond"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  loading="lazy"
                  quality={65}
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow mb-5">Our History</p>
                <h2 className="text-display">From a chamber at Tis Hazari</h2>
                <div className="rule-gold mt-6" aria-hidden="true" />
              </Reveal>

              <Reveal delay={0.08}>
                <div className="prose-legal mt-7">
                  {firm.history.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="bg-stone py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Milestones"
            title="How the practice grew"
            description="Nearly three decades of deliberate expansion — from a single chamber at Tis Hazari to representation across Delhi's district courts and the High Court."
          />

          <div className="relative mt-16">
            {/* Spine of the timeline. */}
            <div
              className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-line lg:left-1/2 lg:-translate-x-px"
              aria-hidden="true"
            />

            <Stagger className="space-y-10 lg:space-y-0">
              {timeline.map((milestone, index) => {
                const isEven = index % 2 === 0;

                return (
                  <StaggerItem key={milestone.year} className="relative lg:grid lg:grid-cols-2 lg:gap-16">
                    {/* Node */}
                    <span
                      className="absolute left-0 top-2 grid h-4 w-4 place-items-center rounded-full border-2 border-gold bg-white lg:left-1/2 lg:-translate-x-1/2"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    </span>

                    <div
                      className={
                        isEven
                          ? 'pl-10 lg:col-start-1 lg:pb-14 lg:pl-0 lg:pr-16 lg:text-right'
                          : 'pl-10 lg:col-start-2 lg:pb-14 lg:pl-16'
                      }
                    >
                      <p className="font-display text-2xl leading-none text-gold sm:text-3xl">
                        {milestone.year}
                      </p>
                      <h3 className="mt-3 font-display text-xl">{milestone.title}</h3>

                      {milestone.subtitle ? (
                        <p className="mt-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-light">
                          {milestone.subtitle}
                        </p>
                      ) : null}

                      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
                        {milestone.description.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Tags rather than a bulleted list: markers sit on the wrong
                          side once the column flips to right-aligned at lg. */}
                      {milestone.highlights ? (
                        <ul
                          className={
                            isEven
                              ? 'mt-4 flex flex-wrap gap-2 lg:justify-end'
                              : 'mt-4 flex flex-wrap gap-2'
                          }
                        >
                          {milestone.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="border border-line bg-white px-3 py-1.5 font-body text-[0.6875rem] font-medium tracking-wide text-muted"
                            >
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* Core values / why clients trust us */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Core Values"
            title="Why clients trust us"
            description="Six operating commitments that shape how every matter in this office is run."
          />

          <Stagger className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {firm.trustReasons.map((reason, index) => (
              <StaggerItem key={reason.id} className="h-full">
                <FeatureCard feature={reason} index={index} className="h-full" />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Founder message */}
      <section className="bg-ink texture-dark py-20 lg:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal direction="right" className="lg:col-span-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-700">
                <Image
                  src={firm.founder.image}
                  alt={firm.founder.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>

              <div className="mt-6">
                <p className="font-display text-xl text-white">{firm.founder.name}</p>
                <p className="mt-1.5 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
                  {firm.founder.designation}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-8">
              <TbQuote className="h-12 w-12 text-gold/25" aria-hidden="true" />

              <h2 className="mt-6 text-title text-white">A message from our founder</h2>

              <blockquote className="mt-7 space-y-5 text-base leading-relaxed text-white/65 lg:text-lg">
                {firm.founder.message.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </blockquote>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Office gallery */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow="Our Office"
            title="Where we meet our clients"
            description="Consultations take place in private rooms in our chambers, or by video call where travelling is impractical."
          />

          <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) => (
              <StaggerItem key={image.src}>
                <figure className="group relative overflow-hidden bg-stone">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                    />
                  </div>

                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-12">
                    <span className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white">
                      {image.caption}
                    </span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
