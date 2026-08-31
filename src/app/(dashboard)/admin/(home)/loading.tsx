import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <SkeletonScreen
      label="Loading the admin dashboard"
      className="mx-auto max-w-6xl space-y-6"
    >
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
          <div className="w-full max-w-xl">
            <Skeleton className="h-3 w-36" variant="brand" />
            <Skeleton className="mt-3 h-9 w-64 max-w-full" />
            <Skeleton className="mt-4 h-4 w-full max-w-md" variant="subtle" />
          </div>
          <Skeleton className="h-10 w-36 shrink-0 rounded-xl" variant="brand" />
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
            <Skeleton className="mt-2 h-3 w-28" variant="subtle" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" variant="brand" />
              <Skeleton className="h-4 w-12" variant="subtle" />
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
