import Image from 'next/image';
import { TbCheck } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { Service } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  /** Above-the-fold cards skip lazy loading to protect LCP. */
  priority?: boolean;
  className?: string;
}

export function ServiceCard({ service, priority = false, className }: ServiceCardProps) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden border border-line bg-white transition-all duration-500 ease-luxe hover:border-gold/40 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
        />
        <span
          className="absolute bottom-0 left-0 grid h-12 w-12 place-items-center bg-gold text-ink"
          aria-hidden="true"
        >
          <Icon name={service.icon} className="h-6 w-6" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7 lg:p-8">
        <h3 className="font-display text-xl leading-snug">{service.title}</h3>

        <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>

        <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
          {service.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-muted">
              <TbCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 pt-1">
          <Button href={service.ctaHref} variant="outline" size="sm" className="w-full">
            {service.ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
