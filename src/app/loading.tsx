import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

/**
 * App-shell fallback. Every route segment ships its own skeleton, so this only
 * appears for the brief window before a segment's own boundary takes over.
 */
export default function Loading() {
    return (
        <SkeletonScreen
            label="Loading Hirelane"
            className="flex flex-1 flex-col items-center justify-center gap-6 bg-white px-6 py-24"
        >
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" variant="brand" />
                <Skeleton className="h-5 w-28" variant="brand" />
            </div>

            <div className="w-full max-w-md space-y-3">
                <Skeleton className="mx-auto h-4 w-3/4" variant="subtle" />
                <Skeleton className="mx-auto h-4 w-1/2" variant="subtle" />
            </div>
        </SkeletonScreen>
    );
}
