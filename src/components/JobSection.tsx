import { Job } from "@/types/JobTypes";
import EmptyState from "./EmptyState";
import JobCard from "./JobCard";
import { getJobs } from "@/lib/job-query";

type JobSearchResult = Awaited<ReturnType<typeof getJobs>>;

export default function JobSection({
  result,
}: {
  result: JobSearchResult;
}) {
  return (
    <div>
      {result.jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          <div>
            <p className="m-1 text-2xl font-extrabold text-gray-950">
              {result.total.toLocaleString()}{" "}
              {result.total === 1 ? "open role" : "open roles"}
            </p>
            <p className="m-1 text-sm text-gray-950">
              Showing {result.jobs.length} of{" "}
              {result.total.toLocaleString()} open roles
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-5">
            {result.jobs.map((job: Job) => (
              <JobCard key={job._id.toString()} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}