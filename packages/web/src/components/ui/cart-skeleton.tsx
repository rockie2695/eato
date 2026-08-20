/**
 * Cart Skeleton.
 *
 * Skeleton loader for the cart page.
 * Mimics cart item structure while data loads.
 *
 * @example
 * <CartSkeleton />
 */

import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

export function CartSkeleton() {
  return (
    <div className="container px-4 py-8">
      {/* Header skeleton */}
      <Skeleton className="h-10 w-32 mb-6" />
      <Skeleton className="h-8 w-36 mb-8" />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order summary skeleton */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
