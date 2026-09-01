import { cn } from '@/lib/utils';

/** Base shimmer block. Compose these into route-level loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer rounded-[2px] bg-stone', className)}
      aria-hidden="true"
    />
  );
}

/** Placeholder matching the practice-area / service card footprint. */
export function CardSkeleton() {
  return (
    <div className="border border-line p-8">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="mt-6 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-6 h-3 w-24" />
    </div>
  );
}

/** Placeholder for a grid of cards, used by `loading.tsx` route files. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white">
          <CardSkeleton />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading text">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
