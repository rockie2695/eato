/**
 * Page Loading Component.
 *
 * Full-page centered loading spinner with optional text.
 * Used when navigating between pages or loading initial data.
 *
 * @example
 * <PageLoading />
 * <PageLoading text="Loading your orders..." />
 */

import { UtensilsCrossed } from 'lucide-react';
import { Spinner } from './spinner';

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <div className="relative h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <UtensilsCrossed className="h-8 w-8 text-primary animate-bounce" />
        </div>
      </div>
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
