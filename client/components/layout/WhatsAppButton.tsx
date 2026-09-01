'use client';

import { useEffect, useState } from 'react';
import { TbBrandWhatsapp, TbX } from 'react-icons/tb';
import { site, whatsappHref } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Floating WhatsApp launcher, present on every page.
 *
 * Mounts after a short delay so it never competes with the hero for attention,
 * or for main-thread time during the LCP window. Transitions are CSS rather than
 * Framer Motion — this component is in the root layout, so any library it
 * imports lands in every page's bundle.
 *
 * Expands into a prompt card on hover or keyboard focus, so the purpose is clear
 * before the tap.
 */
export function WhatsAppButton() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Prompt card */}
      <div
        aria-hidden={!isExpanded}
        className={cn(
          'relative w-64 origin-bottom-right border border-line bg-white p-4 shadow-card-hover',
          'transition-all duration-200 ease-luxe',
          isExpanded
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0',
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-label="Dismiss WhatsApp prompt"
          tabIndex={isExpanded ? 0 : -1}
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center text-muted-light transition-colors hover:text-ink"
        >
          <TbX className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <p className="pr-6 font-display text-sm leading-snug text-ink">Need legal assistance?</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Message us on WhatsApp and we will respond during working hours.
        </p>
      </div>

      {/* Launcher */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${site.shortName} on WhatsApp (opens in a new tab)`}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-300 ease-luxe hover:scale-105"
      >
        {/* Slow pulse to draw the eye without demanding it. */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 motion-safe:animate-ping motion-safe:[animation-duration:2.6s]"
          aria-hidden="true"
        />
        <TbBrandWhatsapp className="relative h-7 w-7" aria-hidden="true" />
      </a>
    </div>
  );
}
