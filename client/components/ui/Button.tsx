import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'dark' | 'outline' | 'outlineLight' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 font-body font-semibold ' +
  'tracking-wide uppercase transition-all duration-300 ease-luxe ' +
  'disabled:pointer-events-none disabled:opacity-55 rounded-[2px] ' +
  'motion-safe:hover:-translate-y-0.5';

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-ink hover:bg-gold-400 hover:shadow-gold',
  dark: 'bg-ink text-white hover:bg-ink-700 hover:shadow-card-hover',
  outline: 'border border-ink/25 text-ink hover:border-gold hover:text-gold-700',
  outlineLight: 'border border-white/35 text-white hover:border-gold hover:text-gold-300',
  ghost: 'text-ink hover:text-gold-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.6875rem]',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-[0.8125rem]',
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Icon rendered after the label — typically a chevron or arrow. */
  icon?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  /** Opens in a new tab with the required rel attributes. */
  external?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Single button primitive for links and actions alike.
 *
 * Renders `next/link` for internal hrefs (client-side navigation + prefetch),
 * a plain anchor for external and `tel:` / `mailto:` / `https:` hrefs, and a
 * real `<button>` otherwise — so semantics follow behaviour automatically.
 */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, icon } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in props && props.href !== undefined) {
    const { href, external, ...rest } = props as ButtonAsLink;
    const isExternal =
      external ||
      /^(https?:|tel:|mailto:|wa\.me)/.test(href) ||
      href.startsWith('//');

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith('http') || href.startsWith('//')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          aria-label={rest['aria-label']}
          onClick={rest.onClick}
        >
          {children}
          {icon}
        </a>
      );
    }

    return (
      <Link href={href} prefetch={false} className={classes} aria-label={rest['aria-label']} onClick={rest.onClick}>
        {children}
        {icon}
      </Link>
    );
  }

  const { children: _children, variant: _v, size: _s, className: _c, icon: _i, ...buttonProps } =
    props as ButtonAsButton;

  return (
    <button className={classes} {...buttonProps}>
      {children}
      {icon}
    </button>
  );
}
