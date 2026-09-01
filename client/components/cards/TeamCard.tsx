import Image from 'next/image';
import type { TeamMember } from '@/types';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  member: TeamMember;
  priority?: boolean;
  className?: string;
}

/** Portrait with the advocate's name beneath it — no further detail by design. */
export function TeamCard({ member, priority = false, className }: TeamCardProps) {
  return (
    <article
      id={member.slug}
      className={cn(
        'group flex h-full flex-col overflow-hidden border border-line bg-white transition-all duration-500 ease-luxe hover:border-gold/40 hover:shadow-card-hover',
        // Offset the sticky navbar when linked to directly via #slug.
        'scroll-mt-28',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        <Image
          src={member.image}
          alt={member.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          /*
            These portraits range from 1:1 to 0.45:1, so a 4/5 box crops the
            taller ones heavily. `top` is the right default — centring cut the
            head off. Photos with a wide white margin above the subject set
            their own `imagePosition` so the crop starts below that margin
            rather than showing it.
          */
          style={{ objectPosition: member.imagePosition ?? 'top' }}
          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <div className="p-6 lg:p-7">
        <h3 className="font-display text-lg leading-snug">{member.name}</h3>

        {member.barCouncilId ? (
          <p className="mt-1.5 font-body text-[0.6875rem] leading-relaxed tracking-wide text-muted">
            {member.barCouncilId}
          </p>
        ) : null}
      </div>
    </article>
  );
}

