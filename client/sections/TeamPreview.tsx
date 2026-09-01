import { TbArrowRight } from 'react-icons/tb';
import { TeamCard } from '@/components/cards/TeamCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { featuredTeam } from '@/content';

export function TeamPreview() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our Team"
          title="The advocates who will handle your matter"
          description="The partner who takes your first consultation retains the brief and appears in it. Here is who that could be."
        />

        <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/*
            No `priority` here. This section sits well below the fold on the
            home page, but `priority` emits a <link rel="preload"> in <head>,
            so the first advocate's portrait was being fetched in competition
            with the stylesheet and fonts the hero <h1> (the LCP element) is
            waiting on. Lazy loading is the correct behaviour for it.
          */}
          {featuredTeam.slice(0, 3).map((member) => (
            <StaggerItem key={member.slug} className="h-full">
              <TeamCard member={member} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 text-center">
          <Button
            href="/team"
            variant="outline"
            size="lg"
            icon={
              <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            }
          >
            Meet the Full Team
          </Button>
        </div>
      </Container>
    </section>
  );
}
