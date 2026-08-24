import Link from "next/link";
import { requireEmployer } from "@/lib/session";
import { getCompanyJobs } from "@/lib/employer-query";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { formatJobType, formatInr } from "@/lib/utils/format";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EmployerPage() {
  const user = await requireEmployer();
  const jobs = await getCompanyJobs(user.companyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400">
            EMPLOYER
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
            Posted roles
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Welcome{user.name ? `, ${user.name}` : ""}. Manage drafts and
            published roles for your company.
          </p>
        </div>

        <Link
          href="/employer/jobs/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Post a job
        </Link>

      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No roles yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first draft and publish when you are ready.
          </p>
          <Link
            href="/employer/jobs/new"
            className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Post a job
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={String(job._id)}
              className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-gray-950">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {job.location}
                    {job.type ? ` · ${formatJobType(job.type)}` : ""}
                    {job.isRemote ? " · Remote" : " · On-site"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatInr(job.salaryMin)} – {formatInr(job.salaryMax)} ·
                    Updated {formatDate(job.updatedAt)}
                  </p>
                </div>
                <JobStatusBadge status={job.status ?? "draft"} />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/employer/jobs/${job._id}/edit`}
                  className="rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2e46ba] transition hover:bg-indigo-100"
                >
                  Edit
                </Link>
                <Link
                  href={`/employer/jobs/${job._id}/applicants`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Applicants
                </Link>
                {job.status === "published" && job.slug ? (
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    View public page
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}