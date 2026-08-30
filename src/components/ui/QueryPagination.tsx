import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const STEP_BASE =
  "flex h-10 items-center gap-2 rounded-xl px-3 text-sm sm:px-4";
const STEP_ACTIVE = `${STEP_BASE} bg-white hover:bg-gray-50`;
const STEP_DISABLED = `${STEP_BASE} text-gray-300`;

export default function QueryPagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className={STEP_ACTIVE}>
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
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter(
            (pageNumber) =>
              pageNumber === 1 ||
              pageNumber === totalPages ||
              Math.abs(pageNumber - page) <= 1,
          )
          .map((pageNumber, index, pages) => {
            const previousPage = pages[index - 1];
            const showEllipsis = previousPage && pageNumber - previousPage > 1;

            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-2 text-gray-400">...</span>
                ) : null}
                <Link
                  href={hrefForPage(pageNumber)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${
                    pageNumber === page
                      ? "bg-[#2E46BA] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </Link>
              </div>
            );
          })}
      </div>

      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} className={STEP_ACTIVE}>
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
