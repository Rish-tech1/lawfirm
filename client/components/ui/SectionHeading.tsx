import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  /** Small uppercase gold label above the title. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** `light` for use on dark backgrounds. */
  tone?: 'dark' | 'light';
  /** Heading level — keeps the document outline correct per page. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  const isCentered = align === 'center';

  return (
    <Reveal
      className={cn(
        'flex flex-col',
        isCentered ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow mb-5', tone === 'light' && 'text-gold-300')}>{eyebrow}</p>
      ) : null}

      <Tag
        className={cn(
          'text-display',
          tone === 'light' ? 'text-white' : 'text-ink',
          isCentered ? 'max-w-3xl' : 'max-w-2xl',
        )}
      >
        {title}
      </Tag>

      <div className={cn('rule-gold mt-6', isCentered && 'mx-auto')} aria-hidden="true" />

      {description ? (
        <p
          className={cn(
            'mt-6 text-base leading-relaxed sm:text-lg',
            tone === 'light' ? 'text-white/70' : 'text-muted',
            isCentered ? 'max-w-2xl' : 'max-w-xl',
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
