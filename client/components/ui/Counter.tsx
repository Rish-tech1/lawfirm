'use client';

import { useEffect, useRef, useState } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/lib/utils';

interface CounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * Animated statistic.
 *
 * Uses a plain IntersectionObserver rather than Framer Motion's `useInView`,
 * which kept the whole animation library in the bundle for four numbers on the
 * home page.
 *
 * Accessibility: the animated digits are `aria-hidden` and the final value is
 * exposed through a visually hidden span. An `aria-label` on the wrapping
 * `<span>` would be an ARIA attribute on an element with no role, which is
 * prohibited and fails audit — and screen readers would announce it
 * inconsistently anyway.
 */
export function Counter({ value, suffix = '', className, duration = 1800 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const displayed = useCountUp({
    target: value,
    duration,
    start: isInView,
    disabled: prefersReducedMotion,
  });

  const finalLabel = `${formatNumber(value)}${suffix}`;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {formatNumber(displayed)}
        {suffix}
      </span>
      <span className="sr-only">{finalLabel}</span>
    </span>
  );
}
