import Link from 'next/link';
import { TbArrowUpRight } from 'react-icons/tb';
import { Icon } from '@/components/ui/Icon';
import type { PracticeArea } from '@/types';
import { cn } from '@/lib/utils';

interface PracticeAreaCardProps {
  area: PracticeArea;
  className?: string;
}

/**
 * Grid tile linking to a practice-area detail page.
 *
 * The whole tile is one anchor rather than a card with a nested "read more"
 * link — a single large target is easier to hit on touch and gives assistive
 * tech one clear destination instead of two competing ones.
 */
export function PracticeAreaCard({ area, className }: PracticeAreaCardProps) {
  return (
    <Link
      href={`/practice-areas/${area.slug}`}
      prefetch={false}
      className={cn(
        'group relative flex h-full flex-col bg-white p-8 transition-colors duration-500 ease-luxe hover:bg-ink lg:p-10',
        className,
      )}
    >
      {/* Gold rule that wipes across the top edge on hover. */}
      <span
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-luxe group-hover:scale-x-100"
        aria-hidden="true"
      />

      <span className="mb-7 inline-flex h-14 w-14 items-center justify-center border border-line text-gold-600 transition-all duration-500 ease-luxe group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
        <Icon name={area.icon} className="h-7 w-7" />
      </span>

      <h3 className="font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-white">
        {area.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/65">
        {area.tagline}
      </p>

      <span className="mt-7 inline-flex items-center gap-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-500 group-hover:text-gold">
        Learn more
        <TbArrowUpRight
          className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
