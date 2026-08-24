import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function JobDetailLoading() {
    return (
        <SkeletonScreen
            label="Loading job details"
            className="min-h-screen flex-1 bg-white"
        >
            <div className="overflow-hidden bg-gray-50 shadow-sm">
                <section className="relative overflow-hidden bg-linear-100 from-white via-white to-indigo-200">
                    <div className="relative px-6 py-12 sm:px-10 lg:py-16">
                        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="mb-6 flex items-center gap-3">
                                    <Skeleton className="h-11 w-11 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" variant="subtle" />
                                    </div>
                                </div>

                                <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
                                <Skeleton className="mt-3 h-10 w-2/3 max-w-md sm:h-12" />

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Skeleton className="h-10 w-36 rounded-full" />
                                    <Skeleton className="h-10 w-28 rounded-full" />
                                    <Skeleton className="h-10 w-24 rounded-full" />
                                </div>
                            </div>

                            <div className="hidden w-full max-w-sm sm:block">
                                <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-11 w-full rounded-xl" variant="subtle" />
                                    <Skeleton className="h-24 w-full rounded-xl" variant="subtle" />
                                    <Skeleton className="h-11 w-full rounded-xl" variant="brand" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_320px] lg:py-14">
                    <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                        <Skeleton className="h-6 w-40" />
                        <div className="mt-6 space-y-3">
                            {[
                                "w-full",
                                "w-11/12",
                                "w-full",
                                "w-4/5",
                                "w-full",
                                "w-3/4",
                                "w-full",
                                "w-5/6",
                                "w-2/3",
                            ].map((w, i) => (
                                <Skeleton
                                    key={i}
                                    className={`h-4 ${w}`}
                                    variant="subtle"
                                />
                            ))}
                        </div>
                    </article>

                    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                        <Skeleton className="h-6 w-32" />
                        <div className="mt-6 grid gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-xl bg-gray-50 p-4">
                                    <Skeleton className="h-3 w-24" variant="subtle" />
                                    <Skeleton className="mt-2 h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </SkeletonScreen>
    );
}
