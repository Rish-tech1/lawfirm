import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

interface LogoProps {
  tone?: 'dark' | 'light';
  className?: string;
  /** Hide the wordmark and show only the emblem (mobile drawer, tight bars). */
  markOnly?: boolean;
}

/**
 * The firm's logo.
 *
 * Two artwork variants ship for each crop: the supplied original (black ink) for
 * light surfaces, and one with the black recoloured to white for the ink-dark
 * navbar and footer. The gold is identical in both — only the neutral ink flips.
 *
 * Both are rendered and cross-faded rather than swapping `src`, because the
 * navbar changes tone mid-scroll and a swap would pop a blank frame while the
 * new file decodes.
 */
/**
 * `sizes` is not optional here despite the fixed width/height.
 *
 * Without it, next/image builds a 1x/2x srcset off the *intrinsic* 1631px
 * width, so the browser fetches the w=3840 candidate to fill a slot that is
 * ~143px wide — roughly 20x the pixels needed, on a `priority` image that is
 * preloaded ahead of the LCP element. Declaring the real rendered width lets
 * Next emit the small candidates from `imageSizes` and the browser pick one.
 *
 * Keep these in sync with `size` below if the rendered height ever changes:
 * width = height x aspect ratio (lockup 1631/455 ≈ 3.59, mark 395/455 ≈ 0.87).
 */
const ART = {
  lockup: {
    dark: '/images/logo-lockup.png',
    light: '/images/logo-lockup-light.png',
    width: 1631,
    height: 455,
    /** Wide lockup: cap the height so the bar keeps its proportions. */
    size: 'h-10 w-auto sm:h-12',
    /** h-10 -> ~143px wide, sm:h-12 -> ~172px. */
    sizes: '(min-width: 640px) 172px, 143px',
  },
  mark: {
    dark: '/images/logo-mark.png',
    light: '/images/logo-mark-light.png',
    width: 395,
    height: 455,
    size: 'h-11 w-auto',
    /** h-11 -> ~38px wide. */
    sizes: '38px',
  },
} as const;

export function Logo({ tone = 'dark', className, markOnly = false }: LogoProps) {
  const isLight = tone === 'light';
  const art = markOnly ? ART.mark : ART.lockup;

  return (
    <Link href="/" className={cn('group inline-flex items-center', className)}>
      <span className="relative inline-block">
        {/*
          The dark-ink copy carries the accessible name in both tones — it stays
          in the DOM when faded out, so the link is named identically either way.
          Its alt is the firm name, which is also the text drawn in the artwork,
          satisfying WCAG 2.5.3 (Label in Name).
        */}
        <Image
          src={art.dark}
          alt={site.name}
          width={art.width}
          height={art.height}
          sizes={art.sizes}
          /* Two variants ship on every page for the cross-fade, so the logo is
             billed twice. At ~150px wide the drop from q=75 is not perceptible
             on flat brand artwork, and it takes both copies off the critical
             path sooner. */
          quality={60}
          /**
           * Only the variant that is actually visible gets `priority`. Marking
           * both emitted two <link rel="preload"> tags per logo, so the copy at
           * `opacity-0` competed for bandwidth with the LCP element. The other
           * variant still loads eagerly — it just does not jump the queue —
           * which preserves the cross-fade described above.
           */
          priority={!isLight}
          className={cn(
            art.size,
            'transition-opacity duration-300',
            isLight ? 'opacity-0' : 'opacity-100',
          )}
        />
        <Image
          src={art.light}
          alt=""
          aria-hidden="true"
          width={art.width}
          height={art.height}
          sizes={art.sizes}
          quality={60}
          priority={isLight}
          className={cn(
            art.size,
            'absolute inset-0 transition-opacity duration-300',
            isLight ? 'opacity-100' : 'opacity-0',
          )}
        />
      </span>
    </Link>
  );
}
