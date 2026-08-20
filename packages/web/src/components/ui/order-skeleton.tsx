/**
 * Order Skeleton.
 *
 * Skeleton loader for the orders list page.
 * Mimics order card structure while data loads.
 *
 * @example
 * <OrderSkeleton />
 */

import { Skeleton } from './skeleton';
import { Card, CardContent } from './card';

export function OrderSkeleton() {
  return (
    <div className="container px-4 py-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      {/* Order cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-6 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
