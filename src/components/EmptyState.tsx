import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
    return (
        <div className="col-span-full flex min-h-87.5 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Briefcase
                    size={22}
                    className="text-[#2e46ba]"
                />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No jobs found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-900">
                Try changing your search or removing some
                filters to see more opportunities.
            </p>

            <Link prefetch={false}
                href="/jobs"
                className="mt-5 rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 hover:scale-105 transition-all"
            >
                Clear filters
            </Link>
        </div>
    );
}