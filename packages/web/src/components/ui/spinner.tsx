/**
 * Spinner Component.
 *
 * A circular loading indicator with optional label.
 * Used inline with text or centered on pages.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" label="Loading menu..." />
 * <Spinner className="h-4 w-4" />
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'default', label, className }: SpinnerProps) {
  return (
    <div className="flex items-center gap-2">
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size], className)}
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
