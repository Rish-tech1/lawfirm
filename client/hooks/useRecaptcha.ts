'use client';

import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = 'recaptcha-v3';

/**
 * Optional reCAPTCHA v3.
 *
 * Spam protection degrades gracefully: with no site key configured this is a
 * no-op and the server falls back to the honeypot plus timing and rate-limit
 * checks. That keeps local development and first deploys working without
 * anyone having to provision Google keys first.
 *
 * The script is injected on mount rather than in the document head so it never
 * blocks first paint on pages that carry a form.
 */
export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const isEnabled = Boolean(SITE_KEY);

  useEffect(() => {
    if (!isEnabled) return;
    if (document.getElementById(SCRIPT_ID)) {
      setIsReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => setIsReady(false);
    document.head.appendChild(script);
  }, [isEnabled]);

  /**
   * Returns a token, or undefined when reCAPTCHA is disabled or unavailable.
   * Failure is never fatal — the server decides what to do with a missing token.
   */
  const execute = useCallback(
    async (action: string): Promise<string | undefined> => {
      if (!isEnabled || !isReady || !window.grecaptcha) return undefined;

      try {
        return await new Promise<string>((resolve, reject) => {
          window.grecaptcha!.ready(() => {
            window
              .grecaptcha!.execute(SITE_KEY!, { action })
              .then(resolve)
              .catch(reject);
          });
        });
      } catch {
        return undefined;
      }
    },
    [isEnabled, isReady],
  );

  return { execute, isEnabled, isReady };
}
