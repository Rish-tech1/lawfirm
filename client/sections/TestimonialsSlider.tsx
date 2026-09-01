'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TbArrowLeft, TbArrowRight } from 'react-icons/tb';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Testimonial } from '@/types';
import { cn } from '@/lib/utils';

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  tone?: 'light' | 'dark';
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Testimonial carousel built on native CSS scroll-snap.
 *
 * Native scrolling rather than a transform-driven track: it gives free touch
 * swiping, correct momentum on every platform, and keyboard scrolling for no
 * JavaScript cost. The buttons only nudge `scrollBy`, so the component degrades
 * to a plain horizontally scrollable list if scripting fails.
 */
export function TestimonialsSlider({
  testimonials,
  tone = 'light',
  eyebrow = 'Client Testimonials',
  title = 'What clients say about working with us',
  description = 'Outcomes matter, but so does the experience of being represented. These are clients describing both.',
}: TestimonialsSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDark = tone === 'dark';

  const updateScrollState = useCallback(() => {
    const node = trackRef.current;
    if (!node) return;

    const maxScroll = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(node.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    updateScrollState();
    node.addEventListener('scroll', updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);

    return () => {
      node.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: 1 | -1) => {
    const node = trackRef.current;
    if (!node) return;

    // Advance by one card width plus the gap, derived from the first child so
    // it stays correct across breakpoints without hardcoding sizes.
    const firstCard = node.querySelector('li');
    const step = firstCard ? firstCard.getBoundingClientRect().width + 24 : node.clientWidth * 0.8;

    node.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <section className={cn('py-20 lg:py-28', isDark ? 'bg-ink texture-dark' : 'bg-cream')}>
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
            tone={isDark ? 'light' : 'dark'}
            className="flex-1"
          />

          {/* Controls */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous testimonials"
              className={cn(
                'grid h-12 w-12 place-items-center border transition-all duration-300',
                isDark
                  ? 'border-white/20 text-white hover:border-gold hover:bg-gold hover:text-ink'
                  : 'border-line text-ink hover:border-gold hover:bg-gold',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <TbArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Next testimonials"
              className={cn(
                'grid h-12 w-12 place-items-center border transition-all duration-300',
                isDark
                  ? 'border-white/20 text-white hover:border-gold hover:bg-gold hover:text-ink'
                  : 'border-line text-ink hover:border-gold hover:bg-gold',
                'disabled:pointer-events-none disabled:opacity-30',
              )}
            >
              <TbArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* The scroll container is the labelled region and carries `tabIndex` so
            it is keyboard-scrollable; the `ul` inside keeps its list semantics
            rather than having them overridden by a role. */}
        <div
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label="Client testimonials, scrollable"
          className={cn(
            'mt-14 overflow-x-auto pb-4',
            'snap-x snap-mandatory',
            // Hide the scrollbar without disabling scrolling.
            '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          )}
        >
          <ul className="flex gap-6">
            {testimonials.map((testimonial) => (
              <li
                key={testimonial.id}
                className="w-[85vw] shrink-0 snap-start sm:w-[22rem] lg:w-[26rem]"
              >
                <TestimonialCard testimonial={testimonial} tone={tone} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
