import {
    JobFormSkeleton,
    PanelHeaderSkeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function NewJobLoading() {
    return (
        <SkeletonScreen label="Loading the job form" className="space-y-6">
            <PanelHeaderSkeleton />
            <JobFormSkeleton />
        </SkeletonScreen>
    );
}
