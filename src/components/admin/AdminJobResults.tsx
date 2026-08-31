import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getAdminJobs, type AdminJobQuery } from "@/lib/admin-job-query";
import { formatJobType } from "@/lib/utils/format";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import AdminJobsPagination from "@/components/admin/AdminJobsPagination";
import AdminJobActions from "@/components/admin/AdminJobActions";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJobResults({
  query,
}: {
  query: AdminJobQuery;
}) {
  const result = await getAdminJobs(query);
  const filtersActive = Boolean(
    query.q || query.status || query.type || (query.remote && query.remote !== "any"),
  );
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
          No jobs found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {filtersActive
            ? "Try a different title, company, or filter."
            : "No roles have been posted yet."}
        </p>
        {filtersActive ? (
          <Link
            prefetch={false}
            href="/admin/jobs"
            className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-gray-500">
            Showing {rangeStart} - {rangeEnd} of {result.total}
          </p>
          {filtersActive ? (
            <Link
              prefetch={false}
              href="/admin/jobs"
              className="text-sm font-medium text-[#2E46BA] hover:text-[#12329c]"
            >
              Clear filters
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
                    href={`/admin/jobs/${job._id}`}
                    className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {job.companyName ?? "Company"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {job.location}
                    {job.type ? ` · ${formatJobType(job.type)}` : ""}
                    {job.isRemote ? " · Remote" : " · On-site"}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  {job.applicationCount}{" "}
                  {job.applicationCount === 1 ? "application" : "applications"}
                  {" · "}
                  {formatDate(job.createdAt)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    prefetch={false}
                    href={`/admin/jobs/${job._id}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <AdminJobActions
                    jobId={job._id}
                    canClose={job.status === "published"}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Apps</th>
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
                      href={`/admin/jobs/${job._id}`}
                      className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {job.companyName ?? "-"}
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
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {job.applicationCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        prefetch={false}
                        href={`/admin/jobs/${job._id}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <AdminJobActions
                        jobId={job._id}
                        canClose={job.status === "published"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminJobsPagination
        page={result.page}
        totalPages={result.totalPages}
        params={query}
      />
    </>
  );
}
