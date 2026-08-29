import {
    FilterSidebarSkeleton,
    JobCardSkeleton,
    SearchHeroSkeleton,
    Skeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function JobsLoading() {
    return (
        <SkeletonScreen label="Loading jobs" className="flex-1">
            <SearchHeroSkeleton compact />

            <section className="min-h-125 bg-white px-4 py-6 sm:p-7">
                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    <FilterSidebarSkeleton />

                    <div className="space-y-5">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-40" />
                                <Skeleton className="h-4 w-56" variant="subtle" />
                            </div>
                            <Skeleton className="h-9 w-36 rounded-lg" variant="subtle" />
                        </div>

                        <div className="flex flex-col gap-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <JobCardSkeleton key={i} />
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-9 w-9 rounded-lg"
                                    variant="subtle"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </SkeletonScreen>
    );
}
