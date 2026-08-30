import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function EmployerLoading() {
    return (
        <SkeletonScreen
            label="Loading your posted roles"
            className="mx-auto max-w-6xl space-y-6"
        >
            <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
                <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
                    <div className="w-full max-w-xl">
                        <Skeleton className="h-3 w-36" variant="brand" />
                        <Skeleton className="mt-3 h-9 w-56 max-w-full" />
                        <Skeleton className="mt-4 h-4 w-full max-w-md" variant="subtle" />
                    </div>
                    <Skeleton className="h-11 w-32 shrink-0 rounded-xl" variant="brand" />
                </div>
            </section>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
                    >
                        <Skeleton className="h-3 w-20" variant="subtle" />
                        <Skeleton className="mt-3 h-7 w-10" />
                        <Skeleton className="mt-2 h-3 w-24" variant="subtle" />
                    </div>
                ))}
            </div>

            <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <li
                        key={i}
                        className="rounded-2xl bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-52 max-w-full" />
                                <Skeleton className="h-3 w-64 max-w-full" variant="subtle" />
                                <Skeleton className="h-3 w-44 max-w-full" variant="subtle" />
                            </div>
                            <Skeleton className="h-6 w-20 shrink-0 rounded-full" variant="brand" />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Skeleton className="h-9 w-16 rounded-lg" variant="brand" />
                            <Skeleton className="h-9 w-24 rounded-lg" variant="subtle" />
                            <Skeleton className="h-9 w-32 rounded-lg" variant="subtle" />
                        </div>
                    </li>
                ))}
            </ul>
        </SkeletonScreen>
    );
}
