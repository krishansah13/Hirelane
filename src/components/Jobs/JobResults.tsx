import { getJobs, toJobQuery } from "@/lib/job-query";
import { jobQuerySchema } from "@/lib/validation";
import { JobSearchProps } from "@/types/JobTypes";
import JobSection from "./JobSection";
import Pagination from "./Pagination";

const JOBS_PER_PAGE = 10;

export default async function JobResults({
  currentParams,
}: {
  currentParams: JobSearchProps;
}) {
  const query = jobQuerySchema.parse(currentParams);
  const result = await getJobs(toJobQuery(query, JOBS_PER_PAGE));

  return (
    <>
      <JobSection result={result} />

      {result.jobs.length > 0 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          params={currentParams}
        />
      )}
    </>
  );
}
