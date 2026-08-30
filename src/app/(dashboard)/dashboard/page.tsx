import Link from "next/link";
import { ArrowUpRight, Inbox, Sparkles } from "lucide-react";
import { requireSeeker } from "@/lib/session";
import {
  buildDashboardHref,
  getMyApplications,
  getMyApplicationStats,
  toSeekerApplicationQuery,
} from "@/lib/application-query";
import { seekerApplicationQuerySchema } from "@/lib/validation";
import StageBadge from "@/components/StageBadge";
import CompanyLogo from "@/components/CompanyLogo";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import QueryPagination from "@/components/ui/QueryPagination";
import { formatJobType } from "@/lib/utils/format";

function formatDate(value?: string | Date) {
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSeeker();
  const params = await searchParams;
  const parsed = seekerApplicationQuerySchema.safeParse(params);
  const query = parsed.success ? toSeekerApplicationQuery(parsed.data) : { page: 1 };

  const [stats, result] = await Promise.all([
    getMyApplicationStats(user.id),
    getMyApplications(user.id, query),
  ]);

  const greeting = firstName(user.name);
  const statCards = [
    { label: "In progress", value: stats.active, hint: "Still moving" },
    { label: "Interviews", value: stats.interview, hint: "On the calendar" },
    { label: "Offers", value: stats.offer, hint: "Ready to decide" },
    { label: "Total applied", value: stats.total, hint: "All roles" },
  ];

  const filtersActive = Boolean(query.q || query.stage);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="mx-auto  space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Your applications
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Track every role you have applied to and see where it sits in the
              pipeline.
            </p>
          </div>

          <Link prefetch={false}
            href="/jobs"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Find jobs
            <ArrowUpRight size={15} />
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

      <DashboardSearch params={query} />

      {result.applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Inbox size={22} className="text-[#2e46ba]" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            {filtersActive ? "No applications found" : "No applications yet"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {filtersActive
              ? "Try a different role, company, or stage."
              : "Browse open roles and submit your first application. Your pipeline will show up here."}
          </p>
          {filtersActive ? (
            <Link prefetch={false}
              href="/dashboard"
              className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear search
            </Link>
          ) : (
            <Link prefetch={false}
              href="/jobs"
              className="mt-5 inline-flex rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
            >
              Find jobs
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
                  href="/dashboard"
                  className="text-sm font-medium text-[#2E46BA] hover:text-[#12329c]"
                >
                  Clear search
                </Link>
              ) : null}
            </div>

            <ul className="divide-y divide-gray-100 lg:hidden">
              {result.applications.map((application) => (
                <li key={application._id} className="flex items-start gap-3 p-5">
                  <CompanyLogo
                    name={application.company?.name || "Company"}
                    slug={application.company?.slug}
                    src={application.company?.logoURL}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link prefetch={false}
                          href={`/dashboard/applications/${application._id}`}
                          className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                        >
                          {application.job?.title ?? "Role unavailable"}
                        </Link>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {application.company?.name ?? "Company"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {application.job?.location ?? "—"}
                          {application.job?.type
                            ? ` · ${formatJobType(application.job.type)}`
                            : ""}
                          {" · Applied "}
                          {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <StageBadge stage={application.stage} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Location</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Stage</th>
                    <th className="px-6 py-3 font-medium">Applied</th>
                    <th className="px-6 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.applications.map((application) => (
                    <tr key={application._id} className="align-middle">
                      <td className="px-6 py-4">
                        <Link prefetch={false}
                          href={`/dashboard/applications/${application._id}`}
                          className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                        >
                          {application.job?.title ?? "Role unavailable"}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            name={application.company?.name || "Company"}
                            slug={application.company?.slug}
                            src={application.company?.logoURL}
                            size="sm"
                          />
                          <span className="text-gray-600">
                            {application.company?.name ?? "Company"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {application.job?.location ?? "—"}
                        {application.job?.isRemote ? (
                          <span className="block text-xs text-gray-400">
                            Remote
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatJobType(application.job?.type)}
                      </td>
                      <td className="px-6 py-4">
                        <StageBadge stage={application.stage} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(application.appliedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link prefetch={false}
                          href={`/dashboard/applications/${application._id}`}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          View
                        </Link>
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
            hrefForPage={(page) => buildDashboardHref(query, page)}
          />
        </>
      )}
    </div>
  );
}
