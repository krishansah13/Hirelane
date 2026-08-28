import { PanelHeaderSkeleton, Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <SkeletonScreen label="Loading the admin dashboard" className="space-y-6">
      <PanelHeaderSkeleton />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" variant="brand" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-4 w-36" />
            <Skeleton className="mt-3 h-4 w-full" variant="subtle" />
            <Skeleton className="mt-2 h-4 w-4/5" variant="subtle" />
          </div>
        ))}
      </div>
    </SkeletonScreen>
  );
}
