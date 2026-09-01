import { Container } from '@/components/ui/Container';
import { Counter } from '@/components/ui/Counter';
import { Icon } from '@/components/ui/Icon';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { stats } from '@/content';

/** Animated key figures, presented as a definition list. */
export function Stats() {
  return (
    <section className="relative border-b border-line bg-cream py-16 lg:py-20" aria-label="Firm at a glance">
      <Container>
        <Stagger className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4" as="dl">
          {stats.map((stat) => (
            <StaggerItem key={stat.id} className="flex flex-col items-center text-center">
              <span
                className="mb-5 grid h-12 w-12 place-items-center border border-gold/30 text-gold-600"
                aria-hidden="true"
              >
                <Icon name={stat.icon} className="h-6 w-6" />
              </span>

              {/* `dt` precedes `dd` in source order for valid markup; the
                  visual order is flipped with flex `order`. */}
              <dt className="order-2 mt-3 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </dt>

              <dd className="order-1 font-display text-4xl leading-none text-ink lg:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
