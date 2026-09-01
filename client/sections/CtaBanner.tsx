import { TbArrowRight, TbBrandWhatsapp, TbPhone } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { site, whatsappHref } from '@/content/site';

interface CtaBannerProps {
  title?: string;
  description?: string;
  /** Show the WhatsApp button alongside the primary actions. */
  showWhatsApp?: boolean;
}

export function CtaBanner({
  title = 'Need legal assistance?',
  description = 'Book your consultation today. You will get a candid assessment of your position, a realistic timeline and a fee quote — before you commit to anything.',
  showWhatsApp = true,
}: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gold">
      {/* Diagonal ink wash for depth without a second colour. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, #111 0, #111 1px, transparent 1px, transparent 14px)',
        }}
      />

      <Container className="relative">
        <div className="flex flex-col items-start gap-10 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-display text-ink">{title}</h2>
            <p className="mt-5 text-base leading-relaxed text-ink/70 sm:text-lg">{description}</p>
          </Reveal>

          <Reveal delay={0.1} className="flex shrink-0 flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <Button
              href="/contact"
              variant="dark"
              size="lg"
              icon={
                <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              }
            >
              Book Consultation
            </Button>

            <Button
              href={`tel:${site.phone.primaryHref}`}
              variant="outline"
              size="lg"
              className="border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-white"
              icon={<TbPhone className="h-4 w-4" />}
              aria-label={`Call the office on ${site.phone.primary}`}
            >
              {site.phone.primary}
            </Button>

            {showWhatsApp ? (
              <Button
                href={whatsappHref}
                variant="outline"
                size="lg"
                className="border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-white"
                icon={<TbBrandWhatsapp className="h-4 w-4" />}
                aria-label="Message us on WhatsApp (opens in a new tab)"
              >
                WhatsApp
              </Button>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
