import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function AdminCompanyDetailLoading() {
  return (
    <SkeletonScreen label="Loading company" className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <Skeleton className="h-4 w-36" variant="brand" />
          <div className="mt-6 flex items-start gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20" variant="subtle" />
              <Skeleton className="mt-2 h-8 w-56 max-w-full" />
              <Skeleton className="mt-3 h-4 w-40" variant="subtle" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
          >
            <Skeleton className="h-3 w-20" variant="subtle" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-24" variant="subtle" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-4 w-full max-w-md" variant="subtle" />
            <Skeleton className="mt-6 h-11 w-full rounded-xl" variant="subtle" />
            <Skeleton className="mt-3 h-11 w-full rounded-xl" variant="subtle" />
            <Skeleton className="mt-3 h-28 w-full rounded-xl" variant="subtle" />
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-5 h-16 w-full rounded-2xl" variant="subtle" />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-5 h-20 w-full rounded-2xl" variant="subtle" />
          <Skeleton className="mt-3 h-20 w-full rounded-2xl" variant="subtle" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
