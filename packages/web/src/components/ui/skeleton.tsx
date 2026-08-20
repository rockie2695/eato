/**
 * Skeleton Component.
 *
 * Animated placeholder for loading states.
 * Used for content that's being fetched (menu items, orders, etc.).
 *
 * @example
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-32 w-full rounded-xl" />
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted',
        shimmer && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}
