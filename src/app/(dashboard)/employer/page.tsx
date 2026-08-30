import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  MapPin,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { requireEmployer } from "@/lib/session";
import { getCompanyJobs } from "@/lib/employer-query";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { formatJobType, formatInr } from "@/lib/utils/format";
import { effectiveJobStatus } from "@/lib/job-status";

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

export default async function EmployerPage() {
  const user = await requireEmployer();
  const jobs = await getCompanyJobs(user.companyId);
  const greeting = firstName(user.name);

  const statuses = jobs.map((job) => effectiveJobStatus(job));
  const counts = {
    live: statuses.filter((status) => status === "published").length,
    draft: statuses.filter((status) => status === "draft").length,
    expired: statuses.filter((status) => status === "expired").length,
    total: jobs.length,
  };

  const stats = [
    { label: "Live", value: counts.live, hint: "Open to applicants" },
    { label: "Drafts", value: counts.draft, hint: "Still in progress" },
    { label: "Expired", value: counts.expired, hint: "Need a refresh" },
    { label: "Total roles", value: counts.total, hint: "All listings" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
        <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#2E46BA]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Posted roles
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Manage drafts and published roles for your company from one
              pipeline.
            </p>
          </div>

          <Link
            href="/employer/jobs/new"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Post a job
            <PlusCircle size={15} />
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
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

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#dcd8ea] bg-white px-6 py-14 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#2E46BA]">
            <Briefcase size={22} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            No roles yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Create your first draft and publish when you are ready. Live roles
            will show up here.
          </p>
          <Link
            href="/employer/jobs/new"
            className="mt-6 inline-flex rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
          >
            Post a job
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold text-gray-950">Your listings</h2>
            <p className="text-xs text-gray-400">
              {jobs.length} {jobs.length === 1 ? "role" : "roles"}
            </p>
          </div>

          <ul className="space-y-3">
            {jobs.map((job) => {
              const status = effectiveJobStatus(job);

              return (
                <li
                  key={String(job._id)}
                  className="rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(76,61,130,0.10)] sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold tracking-tight text-gray-950">
                        {job.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        {job.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} />
                            {job.location}
                          </span>
                        ) : null}
                        {job.type ? (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Briefcase size={11} />
                              {formatJobType(job.type)}
                            </span>
                          </>
                        ) : null}
                        <span className="text-gray-300">•</span>
                        <span>{job.isRemote ? "Remote" : "On-site"}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatInr(job.salaryMin)} – {formatInr(job.salaryMax)} ·
                        Updated {formatDate(job.updatedAt)}
                      </p>
                    </div>
                    <JobStatusBadge status={status} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/employer/jobs/${job._id}/edit`}
                      className="rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2E46BA] transition hover:bg-indigo-100"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/employer/jobs/${job._id}/applicants`}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Applicants
                    </Link>
                    {status === "published" && job.slug ? (
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        View public page
                        <ArrowUpRight size={13} />
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
