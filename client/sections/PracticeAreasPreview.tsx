import { TbArrowRight } from 'react-icons/tb';
import { PracticeAreaCard } from '@/components/cards/PracticeAreaCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { featuredPracticeAreas, practiceAreas } from '@/content';

interface PracticeAreasPreviewProps {
  /** Cap the number of cards shown. Defaults to every featured area. */
  limit?: number;
}

export function PracticeAreasPreview({ limit }: PracticeAreasPreviewProps = {}) {
  const areas =
    typeof limit === 'number' ? featuredPracticeAreas.slice(0, limit) : featuredPracticeAreas;

  return (
    <section className="bg-stone py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Practice Areas"
          title="Counsel across the matters that decide outcomes"
          description={`We practise in ${practiceAreas.length} areas of law, from corporate structuring and taxation to criminal defence, family matters and property disputes.`}
        />

        {/* Hairline grid: the 1px gaps are the background showing through. */}
        <Stagger className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <StaggerItem key={area.slug} className="h-full">
              <PracticeAreaCard area={area} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 text-center">
          <Button
            href="/practice-areas"
            variant="outline"
            size="lg"
            icon={
              <TbArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            }
          >
            View All {practiceAreas.length} Practice Areas
          </Button>
        </div>
      </Container>
    </section>
  );
}
