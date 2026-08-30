import Link from "next/link";
import { ArrowUpRight, Briefcase, PlusCircle, Sparkles } from "lucide-react";
import { requireEmployer } from "@/lib/session";
import {
  buildEmployerJobsHref,
  getCompanyJobs,
  getCompanyJobStats,
  toEmployerJobQuery,
} from "@/lib/employer-query";
import { employerJobQuerySchema } from "@/lib/validation";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import EmployerJobSearch from "@/components/employer/EmployerJobSearch";
import QueryPagination from "@/components/ui/QueryPagination";
import { formatJobType, formatInr } from "@/lib/utils/format";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

export default async function EmployerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireEmployer();
  const params = await searchParams;
  const parsed = employerJobQuerySchema.safeParse(params);
  const query = parsed.success ? toEmployerJobQuery(parsed.data) : { page: 1 };

  const [stats, result] = await Promise.all([
    getCompanyJobStats(user.companyId),
    getCompanyJobs(user.companyId, query),
  ]);

  const greeting = firstName(user.name);
  const statCards = [
    { label: "Live", value: stats.live, hint: "Open to applicants" },
    { label: "Drafts", value: stats.draft, hint: "Still in progress" },
    { label: "Expired", value: stats.expired, hint: "Need a refresh" },
    { label: "Total roles", value: stats.total, hint: "All listings" },
  ];

  const filtersActive = Boolean(query.q || query.status);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="mx-auto max-w-full space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-full">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Posted roles
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Manage drafts and published roles for your company from one
              pipeline.
            </p>
          </div>

          <Link prefetch={false}
            href="/employer/jobs/new"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Post a job
            <PlusCircle size={15} />
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
          >
            <dt className="text-xs font-medium tracking-wide text-gray-400">
              {stat.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {stat.value}
            </dd>
            <p className="mt-1 text-xs text-gray-400">{stat.hint}</p>
          </div>
        ))}
      </dl>

      <EmployerJobSearch params={query} />

      {result.jobs.length === 0 ? (
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
            <Link prefetch={false}
              href="/employer"
              className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear search
            </Link>
          ) : (
            <Link prefetch={false}
              href="/employer/jobs/new"
              className="mt-5 inline-flex rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
            >
              Post a job
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <p className="text-sm text-gray-500">
                Showing {rangeStart}–{rangeEnd} of {result.total}
              </p>
              {filtersActive ? (
                <Link prefetch={false}
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
                      <Link prefetch={false}
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
                        {job.applicationCount === 1
                          ? "applicant"
                          : "applicants"}
                        {" · Updated "}
                        {formatDate(job.updatedAt)}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link prefetch={false}
                      href={`/employer/jobs/${job._id}/edit`}
                      className="rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2E46BA] hover:bg-indigo-100"
                    >
                      Edit
                    </Link>
                    <Link prefetch={false}
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
                        <Link prefetch={false}
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
                          <Link prefetch={false}
                            href={`/employer/jobs/${job._id}/edit`}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <Link prefetch={false}
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
      )}
    </div>
  );
}
