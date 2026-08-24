import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function ApplicationDetailLoading() {
    return (
        <SkeletonScreen label="Loading application" className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <Skeleton className="h-4 w-40" variant="brand" />

                <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-7 w-64 max-w-full" />
                        <Skeleton className="h-4 w-80 max-w-full" variant="subtle" />
                    </div>
                    <Skeleton className="h-6 w-24 shrink-0 rounded-full" variant="brand" />
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-gray-50 p-4">
                            <Skeleton className="h-3 w-28" variant="subtle" />
                            <Skeleton className="mt-2 h-4 w-32" />
                        </div>
                    ))}
                </dl>

                <Skeleton className="mt-6 h-4 w-36" variant="brand" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                    <Skeleton className="h-5 w-28" />
                    <div className="mt-6 space-y-5">
                        <div>
                            <Skeleton className="h-3 w-16" variant="subtle" />
                            <Skeleton className="mt-2 h-4 w-24" variant="brand" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" variant="subtle" />
                            <Skeleton className="h-4 w-full" variant="subtle" />
                            <Skeleton className="h-4 w-11/12" variant="subtle" />
                            <Skeleton className="h-4 w-3/4" variant="subtle" />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                    <Skeleton className="h-5 w-32" />
                    <ol className="mt-6 space-y-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <li key={i} className="flex gap-3">
                                <Skeleton
                                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                    variant="brand"
                                />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" variant="subtle" />
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </SkeletonScreen>
    );
}
