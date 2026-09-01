import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * Scroll-reveal primitives.
 *
 * These are **server components** — they emit markup and CSS custom properties
 * and nothing else. The actual reveal is done by one shared
 * IntersectionObserver (`RevealObserver`, mounted once in the root layout) plus
 * the rules in `globals.css`.
 *
 * They previously wrapped Framer Motion, which meant every revealed element was
 * its own client component with its own observer. On the home page that was
 * ~40 of them, and it dominated main-thread time during hydration. This version
 * ships zero JavaScript per instance and keeps an identical call-site API.
 *
 * For above-the-fold content use `.reveal-on-load` instead (see `Hero`) — an
 * observer-driven reveal cannot run until hydration and would delay LCP.
 */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds of delay, matching the previous Framer Motion API. */
  delay?: number;
  direction?: Direction;
  /** Travel distance in pixels. */
  distance?: number;
  as?: ElementType;
}

/** Translate offsets, expressed as multipliers of `distance`. */
const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

function revealStyle(direction: Direction, distance: number, delay?: number): CSSProperties {
  const offset = offsets[direction];

  return {
    '--reveal-x': `${offset.x * distance}px`,
    '--reveal-y': `${offset.y * distance}px`,
    ...(delay ? { '--reveal-delay': `${Math.round(delay * 1000)}ms` } : {}),
  } as CSSProperties;
}

export function Reveal({
  children,
  className,
  delay,
  direction = 'up',
  distance = 24,
  as: Tag = 'div',
}: RevealProps) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={revealStyle(direction, distance, delay)}
      /* The observer adds `data-revealed` to this node, and can win the race
         against hydration of a route segment — React then sees an attribute the
         server never rendered and warns about a mismatch. The mutation is
         deliberate and cosmetic, so the warning is suppressed for this element
         only (it does not extend to children). */
      suppressHydrationWarning
    >
      {children}
    </Tag>
  );
}

/**
 * Container whose `Reveal`/`StaggerItem` children animate in sequence.
 * The per-child delay is applied by `:nth-child` rules in `globals.css`.
 */
export function Stagger({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** Retained for API compatibility; the cascade is now defined in CSS. */
  gap?: number;
  as?: ElementType;
}) {
  return (
    <Tag data-reveal-group="" className={className}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as: Tag = 'div',
  distance = 22,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  distance?: number;
}) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={revealStyle('up', distance)}
      /* See the note in `Reveal` — same observer-vs-hydration race. */
      suppressHydrationWarning
    >
      {children}
    </Tag>
  );
}
