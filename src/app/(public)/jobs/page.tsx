import { Suspense } from "react";
import { jobQuerySchema } from "@/lib/validation";
import { JobSearchProps } from "@/types/JobTypes";
import HeroSection from "@/components/HeroSection";
import Filters from "@/components/Filters";
import JobResults from "@/components/jobs/JobResults";
import { JobCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

function JobsFallback() {
  return (
    <div className="min-h-100 space-y-5" aria-busy="true">
      <span className="sr-only">Loading job results</span>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" variant="subtle" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" variant="subtle" />
      </div>

      <div className="flex flex-col gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function JobSearch({
  searchParams,
}: {
  searchParams: Promise<JobSearchProps>;
}) {
  const params = await searchParams;
  const parsed = jobQuerySchema.parse(params);

  const currentParams: JobSearchProps = {
    q: parsed.q,
    location: parsed.location,
    type: parsed.type,
    remote: parsed.remote,
    sort: parsed.sort,
    page: parsed.page,
  };

  const suspenseKey = JSON.stringify(currentParams);

  return (
    <main>
      <HeroSection params={currentParams} />

      <section className="min-h-125 bg-white px-4 py-6 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <Filters params={currentParams} />

          {/* min-w-0 lets the results column shrink below its content's
              intrinsic width instead of widening the page on small screens. */}
          <div className="min-w-0">
            <Suspense key={suspenseKey} fallback={<JobsFallback />}>
              <JobResults currentParams={currentParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}