import {
  ListRowSkeleton,
  PanelHeaderSkeleton,
  SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function AdminApprovalsLoading() {
  return (
    <SkeletonScreen label="Loading approvals" className="space-y-6">
      <PanelHeaderSkeleton />
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ListRowSkeleton key={i} withActions />
        ))}
      </ul>
    </SkeletonScreen>
  );
}
