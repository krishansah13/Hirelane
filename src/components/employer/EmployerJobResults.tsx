import Link from "next/link";
import { ArrowUpRight, Briefcase } from "lucide-react";
import {
  buildEmployerJobsHref,
  getCompanyJobs,
  type EmployerJobQuery,
} from "@/lib/employer-query";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import QueryPagination from "@/components/ui/QueryPagination";
import { formatJobType, formatInr } from "@/lib/utils/format";

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EmployerJobResults({
  companyId,
  query,
}: {
  companyId: string;
  query: EmployerJobQuery;
}) {
  const result = await getCompanyJobs(companyId, query);
  const filtersActive = Boolean(query.q || query.status);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  if (result.jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Briefcase size={22} className="text-[#2e46ba]" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-gray-900">
          {filtersActive ? "No roles found" : "No roles yet"}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {filtersActive
            ? "Try a different title, location, or status."
            : "Create your first draft and publish when you are ready. Live roles will show up here."}
        </p>
        {filtersActive ? (
          <Link
            prefetch={false}
            href="/employer"
            className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Clear search
          </Link>
        ) : (
          <Link
            prefetch={false}
            href="/employer/jobs/new"
            className="mt-5 inline-flex rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
          >
            Post a job
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {result.total}
          </p>
          {filtersActive ? (
            <Link
              prefetch={false}
              href="/employer"
              className="text-sm font-medium text-[#2E46BA] hover:text-[#12329c]"
            >
              Clear search
            </Link>
          ) : null}
        </div>

        <ul className="divide-y divide-gray-100 xl:hidden">
          {result.jobs.map((job) => (
            <li key={job._id} className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    prefetch={false}
                    href={`/employer/jobs/${job._id}/edit`}
                    className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {job.location}
                    {job.type ? ` · ${formatJobType(job.type)}` : ""}
                    {job.isRemote ? " · Remote" : " · On-site"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatInr(job.salaryMin)} – {formatInr(job.salaryMax)}
                    {" · "}
                    {job.applicationCount}{" "}
                    {job.applicationCount === 1 ? "applicant" : "applicants"}
                    {" · Updated "}
                    {formatDate(job.updatedAt)}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  prefetch={false}
                  href={`/employer/jobs/${job._id}/edit`}
                  className="rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2E46BA] hover:bg-indigo-100"
                >
                  Edit
                </Link>
                <Link
                  prefetch={false}
                  href={`/employer/jobs/${job._id}/applicants`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Applicants
                </Link>
                {job.status === "published" && job.slug ? (
                  <a
                    href={`/jobs/${job.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    View public page
                    <ArrowUpRight size={13} />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Applicants</th>
                <th className="px-6 py-3 font-medium">Updated</th>
                <th className="px-6 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.jobs.map((job) => (
                <tr key={job._id} className="align-middle">
                  <td className="px-6 py-4">
                    <Link
                      prefetch={false}
                      href={`/employer/jobs/${job._id}/edit`}
                      className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatInr(job.salaryMin)} – {formatInr(job.salaryMax)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {job.location}
                    <span className="block text-xs text-gray-400">
                      {job.isRemote ? "Remote" : "On-site"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatJobType(job.type)}
                  </td>
                  <td className="px-6 py-4">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {job.applicationCount}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(job.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        prefetch={false}
                        href={`/employer/jobs/${job._id}/edit`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <Link
                        prefetch={false}
                        href={`/employer/jobs/${job._id}/applicants`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Applicants
                      </Link>
                      {job.status === "published" && job.slug ? (
                        <a
                          href={`/jobs/${job.slug}`}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          View
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QueryPagination
        page={result.page}
        totalPages={result.totalPages}
        hrefForPage={(page) => buildEmployerJobsHref(query, page)}
      />
    </>
  );
}
