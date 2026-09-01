import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Render as `section`, `header`, `footer` … to keep the outline semantic. */
  as?: ElementType;
  size?: 'narrow' | 'default' | 'wide';
}

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[88rem]',
} as const;

/** Horizontal rhythm wrapper — the only place page gutters are defined. */
export function Container({ children, className, as: Tag = 'div', size = 'default' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', sizes[size], className)}>
      {children}
    </Tag>
  );
}
