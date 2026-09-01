import { TbStarFilled } from 'react-icons/tb';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, max = 5, className, size = 'sm' }: StarRatingProps) {
  const dimension = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="img"
      aria-label={`Rated ${rating} out of ${max}`}
    >
      {Array.from({ length: max }, (_, index) => (
        <TbStarFilled
          key={index}
          className={cn(dimension, index < rating ? 'text-gold' : 'text-line')}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
