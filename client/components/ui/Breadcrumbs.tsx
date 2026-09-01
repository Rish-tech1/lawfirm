import Link from 'next/link';
import { TbChevronRight } from 'react-icons/tb';
import { cn } from '@/lib/utils';

export interface Crumb {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** `light` for use over the dark page banner. */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Visible breadcrumb trail. Emit the matching `breadcrumbSchema()` JSON-LD
 * alongside it so the trail also appears in search results.
 */
export function Breadcrumbs({ items, tone = 'light', className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs tracking-wide">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn(tone === 'light' ? 'text-gold-300' : 'text-gold-700')}
                >
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={cn(
                      'transition-colors',
                      tone === 'light'
                        ? 'text-white/60 hover:text-white'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {item.name}
                  </Link>
                  <TbChevronRight
                    className={cn('h-3 w-3', tone === 'light' ? 'text-white/30' : 'text-line')}
                    aria-hidden="true"
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
