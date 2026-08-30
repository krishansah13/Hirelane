import type { ComponentPropsWithoutRef } from "react";

type SkeletonProps = ComponentPropsWithoutRef<"div"> & {
    variant?: "default" | "subtle" | "brand";
};

const VARIANTS = {
    default: "bg-gray-200/80",
    subtle: "bg-gray-100",
    brand: "bg-[#eef0ff]",
} as const;

export function Skeleton({
    className = "",
    variant = "default",
    ...props
}: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md ${VARIANTS[variant]} ${className}`}
            aria-hidden
            {...props}
        />
    );
}

/** Wraps a route skeleton so screen readers announce a busy region once. */
export function SkeletonScreen({
    label,
    className = "",
    children,
}: {
    label: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div aria-busy="true" aria-live="polite" className={className}>
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}

export function JobCardSkeleton() {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-xs sm:min-h-29 sm:items-center sm:gap-5 sm:px-6 sm:py-5">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12 sm:rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5 max-w-xs" />
                <Skeleton className="h-3 w-3/5 max-w-sm" />
                <div className="hidden flex-wrap gap-1.5 pt-1 sm:flex">
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-md" />
                </div>
            </div>

            <div className="hidden shrink-0 items-center gap-5 sm:flex">
                <Skeleton className="hidden h-3 w-12 lg:block" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </div>
    );
}

export function FilterSidebarSkeleton() {
    return (
        <>
        <div className="lg:hidden">
            <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <aside className="hidden h-fit space-y-7 rounded-2xl p-5 lg:block">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-10" />
            </div>

            <Skeleton className="h-px w-full" variant="subtle" />

            <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>

            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-xl" />
        </aside>
        </>
    );
}

/** Mirrors the gradient search hero used on the landing and jobs pages. */
export function SearchHeroSkeleton({ compact = false }: { compact?: boolean }) {
    return (
        <section className="relative overflow-hidden bg-linear-100 from-white via-white to-indigo-300">
            <div
                className={`relative mx-auto max-w-5xl px-6 sm:px-8 ${compact ? "py-10 sm:py-14" : "py-16 sm:py-24"}`}
            >
                <div className="flex flex-col items-center text-center">
                    <Skeleton className="h-4 w-28" variant="subtle" />
                    <Skeleton className="mt-4 h-11 w-full max-w-lg rounded-xl sm:h-14" />
                    <Skeleton className="mt-4 h-4 w-full max-w-xl" variant="subtle" />
                </div>

                <Skeleton
                    className="mt-10 h-17.5 w-full rounded-2xl"
                    variant="subtle"
                />

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {["w-20", "w-28", "w-24", "w-16", "w-24", "w-20"].map((w, i) => (
                        <Skeleton
                            key={i}
                            className={`h-6 rounded-full ${w}`}
                            variant="subtle"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/** The white rounded page header used across every dashboard screen. */
export function PanelHeaderSkeleton({
    withAction = false,
    withBackLink = false,
}: {
    withAction?: boolean;
    withBackLink?: boolean;
}) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="w-full">
                {withBackLink && <Skeleton className="h-4 w-36" variant="brand" />}
                <Skeleton className={`h-3 w-20 ${withBackLink ? "mt-4" : ""}`} />
                <Skeleton className="mt-3 h-7 w-56 max-w-full" />
                <Skeleton className="mt-4 h-4 w-full max-w-xl" variant="subtle" />
            </div>

            {withAction && (
                <Skeleton className="h-11 w-32 shrink-0 rounded-xl" variant="brand" />
            )}
        </div>
    );
}

/** Stepper + field stack shared by the create and edit job screens. */
export function JobFormSkeleton() {
    return (
        <div className="space-y-6">
            <ol className="flex gap-2">
                {["w-20", "w-24", "w-32", "w-24"].map((w, i) => (
                    <Skeleton
                        key={i}
                        className={`h-7 rounded-full ${w}`}
                        variant={i === 0 ? "brand" : "subtle"}
                    />
                ))}
            </ol>

            <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" variant="subtle" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-44 w-full rounded-xl" variant="subtle" />
                    <Skeleton className="h-3 w-48" variant="subtle" />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Skeleton className="h-11 w-28 rounded-xl" variant="brand" />
                </div>
            </div>
        </div>
    );
}

/** Row used by the seeker application list and the employer job list. */
export function ListRowSkeleton({ withActions = false }: { withActions?: boolean }) {
    return (
        <li className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-52 max-w-full" />
                    <Skeleton className="h-3 w-72 max-w-full" variant="subtle" />
                    <Skeleton className="h-3 w-44 max-w-full" variant="subtle" />
                </div>
                <Skeleton className="h-6 w-20 shrink-0 rounded-full" variant="brand" />
            </div>

            {withActions && (
                <div className="mt-4 flex flex-wrap gap-3">
                    <Skeleton className="h-9 w-16 rounded-lg" variant="brand" />
                    <Skeleton className="h-9 w-24 rounded-lg" variant="subtle" />
                    <Skeleton className="h-9 w-32 rounded-lg" variant="subtle" />
                </div>
            )}
        </li>
    );
}
