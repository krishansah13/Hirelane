import { JobSearchProps } from "@/types/JobTypes";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Labels collapse to bare chevrons on phones so the row fits without wrapping.
const STEP_BASE =
    "flex h-10 items-center gap-2 rounded-xl px-3 text-sm sm:px-4";
const STEP_ACTIVE = `${STEP_BASE} bg-white hover:bg-gray-50`;
const STEP_DISABLED = `${STEP_BASE} text-gray-300`;

function buildUrl(params: JobSearchProps, page: number) {
    const searchParams = new URLSearchParams();

    if (params.q) {
        searchParams.set("q", params.q);
    }

    if (params.location) {
        searchParams.set("location", params.location);
    }

    if (params.type) {
        searchParams.set("type", params.type);
    }

    if (params.remote) {
        searchParams.set("remote", params.remote);
    } 

    if (params.sort) {
        searchParams.set("sort", params.sort);
    }

    searchParams.set("page", String(page));

    return `/jobs?${searchParams.toString()}`;
}

export default function Pagination({
    page,
    totalPages,
    params,
}: {
    page: number;
    totalPages: number;
    params: JobSearchProps;
}) {
    if (totalPages <= 1) {
        return null;
    }
    return (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {page > 1 ? (
                <Link
                    href={buildUrl(params, page - 1)}
                    className={STEP_ACTIVE}
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                </Link>
            ) : (
                <span className={STEP_DISABLED}>
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                </span>
            )}

            <div className="flex items-center gap-1">
                {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                )
                    .filter(
                        (pageNumber) =>
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            Math.abs(pageNumber - page) <= 1
                    )
                    .map((pageNumber, index, pages) => {
                        const previousPage = pages[index - 1];

                        const showEllipsis =
                            previousPage &&
                            pageNumber - previousPage > 1;

                        return (
                            <div key={pageNumber} className="flex items-center gap-1" >
                                {showEllipsis && (
                                    <span className="px-2 text-gray-400">
                                        ...
                                    </span>
                                )}

                                <Link
                                    href={buildUrl(params, pageNumber)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${pageNumber === page
                                        ? "bg-[#2E46BA] text-white"
                                        : "200 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {pageNumber}
                                </Link>
                            </div>
                        );
                    })}
            </div>

            {page < totalPages ? (
                <Link
                    href={buildUrl(params, page + 1)}
                    className={STEP_ACTIVE}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                </Link>
            ) : (
                <span className={STEP_DISABLED}>
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                </span>
            )}
        </div>
    );
}
