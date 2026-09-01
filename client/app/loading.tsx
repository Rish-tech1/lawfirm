import { Container } from '@/components/ui/Container';
import { CardGridSkeleton, Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

/**
 * Route-level loading state.
 *
 * Shown while a route segment streams in. Mirrors the banner-then-grid rhythm
 * of the real pages so the transition does not shift the layout underneath the
 * reader.
 */
export default function Loading() {
  return (
    <>
      <section className="bg-ink pb-16 pt-32 lg:pb-20 lg:pt-44">
        <Container>
          <Skeleton className="h-3 w-40 bg-white/10" />
          <Skeleton className="mt-8 h-12 w-full max-w-2xl bg-white/10" />
          <Skeleton className="mt-4 h-12 w-2/3 max-w-xl bg-white/10" />
          <Skeleton className="mt-8 h-0.5 w-14 bg-gold/30" />
          <div className="mt-7 max-w-2xl space-y-3">
            <Skeleton className="h-4 w-full bg-white/[0.07]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.07]" />
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Skeleton className="mx-auto h-3 w-28" />
            <Skeleton className="mx-auto mt-6 h-10 w-full" />
            <div className="mx-auto mt-8 max-w-xl">
              <TextSkeleton lines={2} />
            </div>
          </div>

          <div className="mt-16">
            <CardGridSkeleton count={6} />
          </div>
        </Container>
      </section>
    </>
  );
}
