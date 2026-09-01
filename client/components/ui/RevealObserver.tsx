'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The single IntersectionObserver behind every scroll reveal on the site.
 *
 * Mounted once in the root layout. One observer for the whole document rather
 * than one per animated element, which is what makes the CSS reveal cheap
 * enough to use as liberally as the design calls for.
 *
 * Elements are unobserved once revealed — reveals play once, so there is no
 * reason to keep paying for their callbacks.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])'),
    );

    if (nodes.length === 0) return;

    // Without IntersectionObserver, reveal everything immediately rather than
    // leaving content permanently hidden.
    if (typeof IntersectionObserver === 'undefined') {
      for (const node of nodes) node.setAttribute('data-revealed', '');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          observer.unobserve(entry.target);
        }
      },
      {
        // Fire slightly before the element is fully in view so the transition
        // completes around the time the reader reaches it.
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      },
    );

    for (const node of nodes) observer.observe(node);

    return () => observer.disconnect();
    // Re-scan after client-side navigation, which swaps in fresh markup.
  }, [pathname]);

  return null;
}

/**
 * Sets `data-reveal-ready` on <html> synchronously, before first paint.
 *
 * This has to be a blocking inline script rather than an effect: the CSS hides
 * unrevealed elements only when this attribute is present, so setting it after
 * hydration would show all content and then hide it again — a visible flash.
 * Running it here also means that with JavaScript disabled the attribute never
 * appears and no content is ever hidden.
 */
export function RevealReadyScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.setAttribute('data-reveal-ready','')`,
      }}
    />
  );
}
