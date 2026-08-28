import {
  ListRowSkeleton,
  PanelHeaderSkeleton,
  Skeleton,
  SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function AdminUsersLoading() {
  return (
    <SkeletonScreen label="Loading users" className="space-y-6">
      <PanelHeaderSkeleton />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <Skeleton className="h-11 w-full rounded-xl" variant="subtle" />
      </div>

      <ul className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListRowSkeleton key={i} withActions />
        ))}
      </ul>
    </SkeletonScreen>
  );
}
