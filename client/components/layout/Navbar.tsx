'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TbClock, TbMail, TbMenu2, TbPhone, TbX } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Logo } from './Logo';
import { mainNav, site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Sticky site header.
 *
 * On the home page it starts transparent over the dark hero and turns solid on
 * scroll; on every other route it is solid from the outset.
 *
 * The mobile drawer is animated with CSS rather than Framer Motion. Because this
 * component lives in the root layout, anything it imports ships on every page —
 * moving the drawer to CSS removed the animation library from the shared bundle
 * altogether.
 *
 * The drawer stays mounted and toggles `visible`/`invisible`. That is doing real
 * work: `visibility: hidden` removes the panel from both the tab order and the
 * accessibility tree for free, while still allowing a transition out, which
 * conditional rendering cannot do. It also locks background scroll, closes on
 * Escape and on route change, and moves focus to its close button on open.
 */
export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === '/';
  /** Transparent only at the very top of the home page. */
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe',
          isTransparent
            ? 'bg-transparent'
            : 'border-b border-line bg-white/95 shadow-[0_1px_20px_-8px_rgba(17,17,17,0.14)] backdrop-blur-md',
        )}
      >
        {/* Utility bar — contact details, desktop only. */}
        <div
          className={cn(
            'hidden overflow-hidden border-b transition-all duration-500 lg:block',
            isTransparent ? 'border-white/10 bg-ink/40' : 'border-line bg-ink',
          )}
        >
          <Container>
            <div className="flex h-10 items-center justify-between gap-6 text-[0.6875rem] tracking-wide text-white/70">
              <div className="flex items-center gap-7">
                <a
                  href={`tel:${site.phone.primaryHref}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-300"
                >
                  <TbPhone className="h-3.5 w-3.5" aria-hidden="true" />
                  {site.phone.primary}
                </a>
                <a
                  href={`mailto:${site.email.general}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-300"
                >
                  <TbMail className="h-3.5 w-3.5" aria-hidden="true" />
                  {site.email.general}
                </a>
              </div>

              <p className="inline-flex items-center gap-2">
                <TbClock className="h-3.5 w-3.5" aria-hidden="true" />
                {site.hours[0]!.days}: {site.hours[0]!.time}
              </p>
            </div>
          </Container>
        </div>

        {/* Main bar */}
        <Container>
          <nav
            className={cn(
              'flex items-center justify-between gap-6 transition-all duration-500',
              isScrolled ? 'h-[4.5rem]' : 'h-20 lg:h-24',
            )}
            aria-label="Primary"
          >
            <Logo tone={isTransparent ? 'light' : 'dark'} />

            <ul className="hidden items-center gap-8 xl:flex">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    data-active={isActive(item.href)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'link-underline font-body text-[0.8125rem] font-medium tracking-wide transition-colors',
                      isTransparent
                        ? 'text-white/85 hover:text-white data-[active=true]:text-white'
                        : 'text-ink/75 hover:text-ink data-[active=true]:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <Button
                href="/contact"
                variant={isTransparent ? 'primary' : 'dark'}
                size="sm"
                className="hidden sm:inline-flex"
              >
                Book Consultation
              </Button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
                className={cn(
                  'grid h-10 w-10 place-items-center border transition-colors xl:hidden',
                  isTransparent
                    ? 'border-white/25 text-white hover:border-gold hover:text-gold-300'
                    : 'border-line text-ink hover:border-gold hover:text-gold-700',
                )}
              >
                <TbMenu2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[60] xl:hidden',
          isOpen ? 'visible' : 'invisible',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
          tabIndex={-1}
          className={cn(
            'absolute inset-0 h-full w-full cursor-default bg-ink/70 backdrop-blur-sm transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ink texture-dark',
            'transition-transform duration-400 ease-luxe motion-reduce:transition-none',
            isOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
            <Logo tone="light" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-10 w-10 place-items-center border border-white/25 text-white transition-colors hover:border-gold hover:text-gold-300"
            >
              <TbX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile">
            <ul className="space-y-1">
              {mainNav.map((item, index) => (
                <li
                  key={item.href}
                  className={cn(
                    'transition-all duration-300 ease-luxe motion-reduce:transition-none',
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                  )}
                  /* Cascade the items in as the panel arrives; collapse the
                     delay on close so the drawer leaves in one motion. */
                  style={{ transitionDelay: isOpen ? `${120 + index * 45}ms` : '0ms' }}
                >
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between border-b border-white/[0.07] py-4 font-display text-lg transition-colors',
                      isActive(item.href) ? 'text-gold' : 'text-white/80 hover:text-white',
                    )}
                  >
                    {item.label}
                    <span className="font-body text-[0.625rem] tracking-widest text-white/25">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4 border-t border-white/10 px-6 py-7">
            <Button href="/contact" variant="primary" size="md" className="w-full">
              Book Consultation
            </Button>

            <div className="space-y-2.5 text-xs text-white/60">
              <a
                href={`tel:${site.phone.primaryHref}`}
                className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
              >
                <TbPhone className="h-4 w-4" aria-hidden="true" />
                {site.phone.primary}
              </a>
              <a
                href={`mailto:${site.email.general}`}
                className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
              >
                <TbMail className="h-4 w-4" aria-hidden="true" />
                {site.email.general}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
