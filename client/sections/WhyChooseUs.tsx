import { FeatureCard } from '@/components/cards/FeatureCard';
import { Container } from '@/components/ui/Container';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { whyChooseUs } from '@/content';

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-ink texture-dark py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="What working with this firm actually looks like"
          description="Six commitments we hold ourselves to on every matter — each one something you can hold us to in turn."
          tone="light"
        />

        <Stagger className="mt-16 grid gap-px bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((feature, index) => (
            <StaggerItem key={feature.id} className="h-full">
              <FeatureCard feature={feature} tone="dark" index={index} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
