import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

const COLUMN_CARDS = [3, 2, 2, 1, 1];

export default function ApplicantsLoading() {
    return (
        <SkeletonScreen label="Loading the applicant pipeline" className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <Skeleton className="h-4 w-32" variant="brand" />
                <Skeleton className="mt-5 h-3 w-20" />
                <Skeleton className="mt-3 h-7 w-64 max-w-full" />
                <Skeleton className="mt-4 h-4 w-28" variant="subtle" />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                {COLUMN_CARDS.map((cards, column) => (
                    <section
                        key={column}
                        className="rounded-2xl bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" variant="brand" />
                            <Skeleton className="h-3 w-4" variant="subtle" />
                        </div>

                        <ul className="mt-4 space-y-3">
                            {Array.from({ length: cards }).map((_, i) => (
                                <li
                                    key={i}
                                    className="space-y-2 rounded-xl border border-gray-100 p-3"
                                >
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" variant="subtle" />
                                    <Skeleton className="h-3 w-20" variant="subtle" />
                                    <Skeleton className="mt-3 h-9 w-full rounded-lg" variant="subtle" />
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </SkeletonScreen>
    );
}
