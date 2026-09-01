'use client';

import { useEffect, useState } from 'react';
import { TbArrowUp } from 'react-icons/tb';
import { cn } from '@/lib/utils';

/**
 * Appears once the user is well down the page; returns them to the top.
 *
 * Always rendered and toggled with CSS classes rather than mounted through
 * Framer Motion's AnimatePresence — a two-property fade on one element is not
 * worth keeping an animation library in every page's bundle. `pointer-events`
 * and `aria-hidden` are toggled with the opacity so the hidden button is neither
 * clickable nor reachable by keyboard or screen reader.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        // Sits above the WhatsApp launcher, offset so the two never overlap.
        'fixed bottom-24 right-5 z-40 grid h-11 w-11 place-items-center border border-ink/15 bg-white text-ink shadow-card sm:bottom-28 sm:right-7',
        'transition-all duration-300 ease-luxe hover:border-gold hover:bg-gold',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <TbArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
