import {
    ListRowSkeleton,
    PanelHeaderSkeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <SkeletonScreen label="Loading your applications" className="space-y-6">
            <PanelHeaderSkeleton />

            <ul className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ListRowSkeleton key={i} />
                ))}
            </ul>
        </SkeletonScreen>
    );
}
