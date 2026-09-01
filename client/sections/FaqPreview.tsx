import { TbArrowRight } from 'react-icons/tb';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { featuredFaqs, faqs } from '@/content';
import { site } from '@/content/site';

export function FaqPreview() {
  return (
    <section className="bg-stone py-20 lg:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Sticky intro column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow mb-5">Frequently Asked</p>

                <h2 className="text-display">Questions clients ask before they instruct us</h2>

                <div className="rule-gold mt-6" aria-hidden="true" />

                <p className="mt-7 text-base leading-relaxed text-muted">
                  If your question is not answered here, ask it directly — we would rather answer it
                  before you engage us than after.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    href="/faq"
                    variant="dark"
                    size="md"
                    icon={
                      <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    }
                  >
                    All {faqs.length} Questions
                  </Button>

                  <Button href={`tel:${site.phone.primaryHref}`} variant="ghost" size="md">
                    Or call us
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Accordion column */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <Accordion
              items={featuredFaqs.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
              }))}
              defaultOpen={0}
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
