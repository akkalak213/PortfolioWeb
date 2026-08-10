import { Skeleton, SkeletonPage } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonPage label="กำลังโหลด">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32 rounded-full" />
          ))}
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  )
}
