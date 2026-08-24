import {
    JobCardSkeleton,
    SearchHeroSkeleton,
    Skeleton,
    SkeletonScreen,
} from "@/components/ui/Skeleton";

export default function HomeLoading() {
    return (
        <SkeletonScreen label="Loading Hirelane" className="flex-1 bg-white">
            <SearchHeroSkeleton />

            <section className="border-y border-[#eeeaf8] bg-white px-6 py-10 sm:px-8">
                <Skeleton className="mx-auto h-3 w-44" variant="subtle" />
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-7 w-28" variant="subtle" />
                    ))}
                </div>
            </section>

            <section className="px-6 py-14 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <Skeleton className="h-6 w-52" />
                    <Skeleton className="mt-3 h-4 w-80 max-w-full" variant="subtle" />

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-[#eeeaf8] bg-white p-5"
                            >
                                <Skeleton className="h-10 w-10 rounded-xl" variant="brand" />
                                <Skeleton className="mt-4 h-4 w-28" />
                                <Skeleton className="mt-2 h-3 w-20" variant="subtle" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f7f5ff] px-6 py-14 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="mt-3 h-4 w-64" variant="subtle" />
                        </div>
                        <Skeleton className="h-4 w-24" variant="subtle" />
                    </div>

                    <div className="mt-8 flex flex-col gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <JobCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-14 sm:px-8">
                <div className="mx-auto max-w-6xl text-center">
                    <Skeleton className="mx-auto h-6 w-48" />
                    <Skeleton className="mx-auto mt-3 h-4 w-72" variant="subtle" />

                    <div className="mt-10 grid gap-6 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <Skeleton
                                    className="h-12 w-12 rounded-full"
                                    variant="brand"
                                />
                                <Skeleton className="mt-4 h-4 w-32" />
                                <Skeleton className="mt-2 h-3 w-44" variant="subtle" />
                                <Skeleton className="mt-1 h-3 w-36" variant="subtle" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 pb-16 sm:px-8">
                <Skeleton
                    className="mx-auto h-52 w-full max-w-6xl rounded-3xl"
                    variant="brand"
                />
            </section>
        </SkeletonScreen>
    );
}
