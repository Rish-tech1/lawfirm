import { Icon } from '@/components/ui/Icon';
import type { Feature } from '@/types';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  feature: Feature;
  tone?: 'light' | 'dark';
  /** Ordinal shown as a faint numeral behind the icon. */
  index?: number;
  className?: string;
}

export function FeatureCard({ feature, tone = 'light', index, className }: FeatureCardProps) {
  const isDark = tone === 'dark';

  return (
    <article
      className={cn(
        'group relative overflow-hidden p-8 transition-colors duration-500 ease-luxe lg:p-9',
        isDark ? 'bg-ink-800 hover:bg-ink-700' : 'bg-white hover:bg-cream',
        className,
      )}
    >
      {typeof index === 'number' ? (
        <span
          className={cn(
            'pointer-events-none absolute right-5 top-3 select-none font-display text-6xl leading-none transition-opacity duration-500',
            isDark ? 'text-white/[0.05]' : 'text-ink/[0.045]',
          )}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      ) : null}

      <span
        className={cn(
          'relative inline-flex h-12 w-12 items-center justify-center transition-all duration-500 ease-luxe',
          isDark
            ? 'border border-white/15 text-gold-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink'
            : 'border border-line text-gold-600 group-hover:border-gold group-hover:bg-gold group-hover:text-ink',
        )}
      >
        <Icon name={feature.icon} className="h-6 w-6" />
      </span>

      <h3
        className={cn(
          'relative mt-6 font-display text-lg leading-snug',
          isDark ? 'text-white' : 'text-ink',
        )}
      >
        {feature.title}
      </h3>

      <p
        className={cn(
          'relative mt-3 text-sm leading-relaxed',
          isDark ? 'text-white/60' : 'text-muted',
        )}
      >
        {feature.description}
      </p>
    </article>
  );
}
