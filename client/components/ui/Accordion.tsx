'use client';

import { useId, useState } from 'react';
import { TbPlus } from 'react-icons/tb';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
  /** Optional category chip shown beside the question. */
  meta?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Index open on first render; `null` opens nothing. */
  defaultOpen?: number | null;
  /** Allow several panels open at once. */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Accessible disclosure list.
 *
 * Two implementation notes:
 *
 *  · The open/close transition is pure CSS, animating `grid-template-rows` from
 *    `0fr` to `1fr`. That replaced Framer Motion, which was the only reason the
 *    animation library was still in the home and FAQ page bundles. Browsers
 *    without interpolable `fr` values simply snap open, which is fine.
 *
 *  · The answer stays mounted and height-collapsed rather than unmounting, so it
 *    remains in the rendered DOM for crawlers and in-page search. It is hidden
 *    from assistive tech while collapsed via `aria-hidden`.
 *
 * Built on button + aria-expanded + aria-controls rather than `<details>` so the
 * single-open behaviour and the transition are both controllable.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [openIndices, setOpenIndices] = useState<number[]>(
    defaultOpen === null ? [] : [defaultOpen],
  );

  const toggle = (index: number) => {
    setOpenIndices((current) => {
      const isOpen = current.includes(index);
      if (allowMultiple) {
        return isOpen ? current.filter((i) => i !== index) : [...current, index];
      }
      return isOpen ? [] : [index];
    });
  };

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item, index) => {
        const isOpen = openIndices.includes(index);
        const headingId = `${baseId}-heading-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                type="button"
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-gold-700"
              >
                <span className="flex-1">
                  <span className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-gold-700 sm:text-xl">
                    {item.question}
                  </span>
                  {item.meta ? (
                    <span className="mt-2 block font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
                      {item.meta}
                    </span>
                  ) : null}
                </span>

                <span
                  className={cn(
                    'mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-luxe',
                    isOpen
                      ? 'rotate-45 border-gold bg-gold text-ink'
                      : 'border-line text-muted group-hover:border-gold group-hover:text-gold-700',
                  )}
                  aria-hidden="true"
                >
                  <TbPlus className="h-4 w-4" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              aria-hidden={!isOpen}
              className={cn(
                'grid transition-all duration-300 ease-luxe motion-reduce:transition-none',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="prose-legal max-w-3xl pb-7 pr-10 text-[0.9375rem]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
