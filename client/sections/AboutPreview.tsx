import Image from 'next/image';
import { TbArrowRight, TbCheck } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { firm } from '@/content';
import { site } from '@/content/site';

export function AboutPreview() {
  const highlights = firm.trustReasons.slice(0, 4);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Imagery */}
          <Reveal direction="right" className="relative">
            {/* 16/9 rather than the photograph's native 2:1 — it gives the block
                enough height to sit beside the copy, and the 5% trimmed from each
                side stays clear of the plaque on the left wall. */}
            <div className="relative aspect-[16/9] overflow-hidden bg-stone">
              <Image
                src="/images/about-chambers.jpg"
                alt="The firm's chambers: panelled walls with the Singla &amp; Singla plaque above the fireplace, bound law reports on the shelves and the partner's desk beyond"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                loading="lazy"
                /* Lighthouse costed the q=75 render at ~20 KiB more than needed.
                   It is a soft-focus interior behind text, so the drop is not
                   visible at the size it renders. */
                quality={65}
                className="object-cover"
              />
            </div>

            {/* Founding-year plaque, offset over the image edge. */}
            <div className="absolute -bottom-8 -right-4 hidden bg-ink p-7 text-center shadow-card-hover sm:block lg:-right-8">
              <p className="font-display text-4xl leading-none text-gold">{site.foundingYear}</p>
              <p className="mt-2 font-body text-[0.625rem] uppercase tracking-[0.2em] text-white/50">
                Established
              </p>
            </div>

            {/* Gold frame offset behind the photograph. */}
            <div
              className="pointer-events-none absolute -left-4 -top-4 -z-10 h-32 w-32 border-l-2 border-t-2 border-gold/40"
              aria-hidden="true"
            />
          </Reveal>

          {/* Copy */}
          <div>
            <Reveal>
              <p className="eyebrow mb-5">About the Firm</p>

              <h2 className="text-display">
                Nearly three decades of candid counsel, <span className="text-gold-gradient">not comfortable answers</span>
              </h2>

              <div className="rule-gold mt-6" aria-hidden="true" />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="prose-legal mt-7 text-[0.9375rem]">
                <p>{firm.introduction[0]}</p>
                <p>{firm.introduction[1]}</p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <ul className="mt-9 grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-700"
                      aria-hidden="true"
                    >
                      <TbCheck className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-medium leading-snug text-ink">{item.title}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-11">
                <Button
                  href="/about"
                  variant="dark"
                  size="lg"
                  icon={
                    <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  }
                >
                  Read More About Us
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
