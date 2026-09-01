'use client';

import { useEffect, useRef, useState } from 'react';
import { TbExternalLink, TbMapPin } from 'react-icons/tb';
import { formatOfficeAddress, offices, site } from '@/content/site';
import { cn } from '@/lib/utils';

interface GoogleMapProps {
  className?: string;
  /** Tailwind aspect-ratio class for the map frame. */
  aspect?: string;
}

/**
 * Embedded office locations, one tab per chamber.
 *
 * The iframe is only mounted once the map scrolls into view. A Google Maps embed
 * pulls in a substantial amount of script and imagery; deferring it keeps it out
 * of the initial page load entirely rather than merely marking it `lazy`, which
 * matters for the Lighthouse performance target. Switching tabs swaps the single
 * iframe rather than mounting three, for the same reason.
 *
 * Set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL to use the Maps Embed API with your own
 * key; otherwise this falls back to the keyless `output=embed` query form. That
 * override is a single fixed URL, so it only applies to the principal office.
 */
export function GoogleMap({ className, aspect = 'aspect-[4/3] sm:aspect-[16/10]' }: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [activeId, setActiveId] = useState(offices[0].id);

  const active = offices.find((office) => office.id === activeId) ?? offices[0];
  const isPrincipal = active.id === offices[0].id;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers): just load it.
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const embedUrl =
    (isPrincipal ? site.map.embedUrl : null) ??
    `https://maps.google.com/maps?q=${encodeURIComponent(active.embedQuery)}&z=16&output=embed`;

  return (
    <div className={cn('group relative overflow-hidden border border-line bg-stone', className)}>
      {/* Chamber switcher. Each tab swaps the iframe below rather than scrolling. */}
      <div
        role="tablist"
        aria-label="Choose an office to show on the map"
        className="flex flex-wrap gap-px border-b border-line bg-line"
      >
        {offices.map((office) => {
          const isActive = office.id === active.id;

          return (
            <button
              key={office.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(office.id)}
              className={cn(
                'flex-1 whitespace-nowrap px-4 py-3.5 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-colors',
                isActive
                  ? 'bg-ink text-gold'
                  : 'bg-white text-muted hover:bg-cream hover:text-ink',
              )}
            >
              {office.name}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className={cn('relative w-full', aspect)}>
        {shouldLoad ? (
          <iframe
            key={active.id}
            src={embedUrl}
            title={`Map showing the ${active.name} office of ${site.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.35] transition-all duration-700 group-hover:grayscale-0"
          />
        ) : (
          /* Placeholder occupying the exact final footprint — no layout shift. */
          <div className="absolute inset-0 grid place-items-center bg-stone">
            <div className="flex flex-col items-center gap-3 text-muted">
              <TbMapPin className="h-8 w-8 animate-shimmer text-gold-600" aria-hidden="true" />
              <p className="text-xs tracking-wide">Loading map…</p>
            </div>
          </div>
        )}
      </div>

      {/* Address card + directions link, overlaid on wider screens. */}
      <div className="border-t border-line bg-white p-5 sm:absolute sm:bottom-5 sm:left-5 sm:max-w-xs sm:border sm:shadow-card">
        <p className="flex items-start gap-2.5 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
          <TbMapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          {active.role}
        </p>

        <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
          {formatOfficeAddress(active)}
        </address>

        <a
          href={active.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-gold-700"
        >
          Get Directions
          <TbExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
