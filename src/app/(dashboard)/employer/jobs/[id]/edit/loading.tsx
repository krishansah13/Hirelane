import {
    JobFormSkeleton,
    PanelHeaderSkeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function EditJobLoading() {
    return (
        <SkeletonScreen label="Loading this job for editing" className="space-y-6">
            <PanelHeaderSkeleton withBackLink />
            <JobFormSkeleton />
        </SkeletonScreen>
    );
}
