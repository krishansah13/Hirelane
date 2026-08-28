import {
  PanelHeaderSkeleton,
  Skeleton,
  SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function AdminCompanyDetailLoading() {
  return (
    <SkeletonScreen label="Loading company" className="space-y-6">
      <PanelHeaderSkeleton withBackLink withAction />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" variant="subtle" />
          <Skeleton className="mt-3 h-11 w-full rounded-xl" variant="subtle" />
          <Skeleton className="mt-3 h-28 w-full rounded-xl" variant="subtle" />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-4 w-40" variant="subtle" />
          <Skeleton className="mt-2 h-4 w-32" variant="subtle" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
