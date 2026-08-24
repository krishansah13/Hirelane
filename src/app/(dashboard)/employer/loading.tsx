import {
    ListRowSkeleton,
    PanelHeaderSkeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function EmployerLoading() {
    return (
        <SkeletonScreen label="Loading your posted roles" className="space-y-6">
            <PanelHeaderSkeleton withAction />

            <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <ListRowSkeleton key={i} withActions />
                ))}
            </ul>
        </SkeletonScreen>
    );
}
