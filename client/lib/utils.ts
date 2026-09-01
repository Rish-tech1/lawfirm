import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones.
 * `cn('p-2', condition && 'p-4')` resolves to `p-4` rather than emitting both.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** `1850` -> `1,850` using the Indian digit grouping (1,85,000). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Absolute URL for canonicals, Open Graph tags and sitemap entries. */
export function absoluteUrl(path: string, baseUrl: string): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalised === '/' ? '' : normalised}`;
}

/** "Rajat Verma" -> "RV". Falls back to the first character for single names. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}
