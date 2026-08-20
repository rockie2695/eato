/**
 * Home Skeleton.
 *
 * Skeleton loader for the home/landing page.
 * Mimics hero, features, and featured items sections.
 *
 * @example
 * <HomeSkeleton />
 */

import { Skeleton } from './skeleton';
import { Card, CardContent } from './card';

export function HomeSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Skeleton className="h-6 w-48 mx-auto rounded-full" />
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-5 w-[500px] mx-auto" />
            <Skeleton className="h-5 w-[400px] mx-auto" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features skeleton */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12 space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured items skeleton */}
      <section className="py-20">
        <div className="container px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
