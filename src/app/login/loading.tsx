import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function LoginLoading() {
    return (
        <SkeletonScreen
            label="Loading sign in"
            className="flex flex-1 items-center justify-center bg-linear-100 from-white via-white to-indigo-300 px-6 py-16"
        >
            <div className="w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-[0_10px_30px_rgba(76,61,130,0.10)]">
                <Skeleton className="h-3 w-24" variant="subtle" />
                <Skeleton className="mt-3 h-7 w-52" />
                <Skeleton className="mt-3 h-4 w-full max-w-xs" variant="subtle" />

                <div className="mt-8 space-y-5">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16" variant="subtle" />
                        <Skeleton className="h-11 w-full rounded-xl" variant="subtle" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" variant="subtle" />
                        <Skeleton className="h-11 w-full rounded-xl" variant="subtle" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-xl" variant="brand" />
                </div>

                <Skeleton className="mt-8 h-px w-full" variant="subtle" />

                <div className="mt-6 space-y-3">
                    <Skeleton className="h-3 w-32" variant="subtle" />
                    <Skeleton className="h-10 w-full rounded-xl" variant="subtle" />
                    <Skeleton className="h-10 w-full rounded-xl" variant="subtle" />
                </div>
            </div>
        </SkeletonScreen>
    );
}
