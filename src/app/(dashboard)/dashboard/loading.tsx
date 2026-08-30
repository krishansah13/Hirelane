import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <SkeletonScreen
      label="Loading your applications"
      className="mx-auto max-w-6xl space-y-6"
    >
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-full max-w-xl">
            <Skeleton className="h-3 w-36" variant="brand" />
            <Skeleton className="mt-3 h-9 w-64 max-w-full" />
            <Skeleton className="mt-4 h-4 w-full max-w-md" variant="subtle" />
          </div>
          <Skeleton className="h-11 w-28 shrink-0 rounded-xl" variant="brand" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
          >
            <Skeleton className="h-3 w-20" variant="subtle" />
            <Skeleton className="mt-3 h-7 w-10" />
            <Skeleton className="mt-2 h-3 w-24" variant="subtle" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-14" variant="subtle" />
            <Skeleton className="mt-2 h-11 w-full rounded-xl" variant="subtle" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl sm:w-44" variant="subtle" />
          <Skeleton className="h-11 w-24 shrink-0 rounded-xl" variant="brand" />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <Skeleton className="h-4 w-40" variant="subtle" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-52 max-w-full" />
                <Skeleton className="h-3 w-36 max-w-full" variant="subtle" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" variant="brand" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
