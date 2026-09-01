import { TbQuote } from 'react-icons/tb';
import { StarRating } from '@/components/ui/StarRating';
import type { Testimonial } from '@/types';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  testimonial: Testimonial;
  /** `story` appends the longer success-story narrative. */
  variant?: 'quote' | 'story';
  tone?: 'light' | 'dark';
  className?: string;
}

export function TestimonialCard({
  testimonial,
  variant = 'quote',
  tone = 'light',
  className,
}: TestimonialCardProps) {
  const isDark = tone === 'dark';

  return (
    <figure
      className={cn(
        'flex h-full flex-col border p-8 transition-all duration-500 ease-luxe lg:p-9',
        isDark
          ? 'border-white/10 bg-ink-800 hover:border-gold/40'
          : 'border-line bg-white hover:border-gold/40 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <StarRating rating={testimonial.rating} />
        <TbQuote
          className={cn('h-8 w-8 shrink-0', isDark ? 'text-gold/30' : 'text-gold/25')}
          aria-hidden="true"
        />
      </div>

      <blockquote className="mt-6 flex-1">
        <p
          className={cn(
            'font-display text-lg leading-relaxed',
            isDark ? 'text-white/90' : 'text-ink',
          )}
        >
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        {variant === 'story' && testimonial.successStory ? (
          <p
            className={cn(
              'mt-5 border-t pt-5 text-sm leading-relaxed',
              isDark ? 'border-white/10 text-white/60' : 'border-line text-muted',
            )}
          >
            {testimonial.successStory}
          </p>
        ) : null}
      </blockquote>

      <figcaption
        className={cn(
          'mt-7 flex items-center gap-4 border-t pt-6',
          isDark ? 'border-white/10' : 'border-line',
        )}
      >
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm',
            isDark ? 'bg-gold/15 text-gold-300' : 'bg-stone text-gold-700',
          )}
          aria-hidden="true"
        >
          {testimonial.initials}
        </span>

        <span className="min-w-0">
          <span
            className={cn(
              'block truncate font-body text-sm font-semibold',
              isDark ? 'text-white' : 'text-ink',
            )}
          >
            {testimonial.name}
          </span>
          <span
            className={cn(
              'block truncate text-xs',
              isDark ? 'text-white/50' : 'text-muted',
            )}
          >
            {testimonial.role} · {testimonial.location}
          </span>
        </span>
      </figcaption>

      <p
        className={cn(
          'mt-4 font-body text-[0.625rem] font-semibold uppercase tracking-[0.16em]',
          isDark ? 'text-gold-300/70' : 'text-gold-600',
        )}
      >
        {testimonial.practiceArea}
      </p>
    </figure>
  );
}
