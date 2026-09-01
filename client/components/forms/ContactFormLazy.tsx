'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Defers the enquiry form until it is close to the viewport.
 *
 * The form pulls in react-hook-form, zod and axios — roughly 70 kB that no
 * other part of the site needs, on a component that sits below the fold on both
 * the home page and every practice-area page. Code-splitting it keeps that
 * weight out of First Load JS and off the main thread during the LCP window.
 *
 * `ssr: false` is safe here specifically: the form cannot be submitted without
 * JavaScript anyway, and the phone, email and WhatsApp details rendered beside
 * it are plain server-rendered links that work regardless. Nothing indexable is
 * lost, because a form body carries no search value.
 */
const ContactForm = dynamic(
  () => import('./ContactForm').then((mod) => ({ default: mod.ContactForm })),
  { ssr: false, loading: () => <FormPlaceholder /> },
);

interface ContactFormLazyProps {
  defaultPracticeArea?: string;
  tone?: 'light' | 'dark';
  className?: string;
}

export function ContactFormLazy({ defaultPracticeArea, tone, className }: ContactFormLazyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

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
      // Start fetching when close to view, keeping hydration out of initial load window.
      { rootMargin: '100px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <ContactForm defaultPracticeArea={defaultPracticeArea} tone={tone} />
      ) : (
        <FormPlaceholder />
      )}
    </div>
  );
}

/**
 * Occupies the form's approximate footprint so scrolling into the section does
 * not shift the layout underneath the reader.
 */
function FormPlaceholder() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading enquiry form">
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <div className="mb-2 h-3 w-24 animate-shimmer bg-stone" />
            <div className="h-[46px] w-full border border-line" />
          </div>
        ))}
      </div>

      {['subject', 'message'].map((field) => (
        <div key={field}>
          <div className="mb-2 h-3 w-24 animate-shimmer bg-stone" />
          <div className={cn('w-full border border-line', field === 'message' ? 'h-40' : 'h-[46px]')} />
        </div>
      ))}

      <div className="h-4 w-3/4 animate-shimmer bg-stone" />
      <div className="h-[54px] w-full animate-shimmer bg-stone" />

      <span className="sr-only">Loading enquiry form…</span>
    </div>
  );
}
