'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
  /** Final value to land on. */
  target: number;
  /** Total run time in milliseconds. */
  duration?: number;
  /** Start counting only once true — wire this to an in-view observer. */
  start: boolean;
  /** Skip the animation and jump straight to `target`. */
  disabled?: boolean;
}

/**
 * requestAnimationFrame counter with an ease-out curve, so the number
 * decelerates into its final value instead of stopping dead.
 *
 * Driven by rAF rather than setInterval: it pauses with the tab, never drifts
 * from the frame clock, and always lands exactly on `target`.
 */
export function useCountUp({ target, duration = 1800, start, disabled = false }: Options): number {
  const [value, setValue] = useState(disabled ? target : 0);
  const frameRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }

    if (!start || startedRef.current) return;
    startedRef.current = true;

    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [start, target, duration, disabled]);

  return value;
}
