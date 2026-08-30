import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Briefcase, Globe, Users } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import {
  buildAdminCompanyDetailEmployersHref,
  getAdminCompanyById,
} from "@/lib/admin-company-query";
import { getAdminEmployers } from "@/lib/admin-query";
import CompanyLogo from "@/components/CompanyLogo";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import AdminCompanyForm from "@/components/admin/AdminCompanyForm";
import AdminCompanyActions from "@/components/admin/AdminCompanyActions";
import AdminAddEmployer from "@/components/admin/AdminAddEmployer";
import AdminEmployerReviewCard from "@/components/admin/AdminEmployerReviewCard";
import QueryPagination from "@/components/ui/QueryPagination";
import { effectiveJobStatus } from "@/lib/job-status";
import { formatJobType } from "@/lib/utils/format";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function websiteHref(website?: string) {
  if (!website) return null;
  if (/^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}

export default async function AdminCompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const pendingPage = Number(query.pendingPage) > 0 ? Number(query.pendingPage) : 1;
  const activePage = Number(query.activePage) > 0 ? Number(query.activePage) : 1;
  const result = await getAdminCompanyById(id);

  if (!result) {
    notFound();
  }

  const { company, jobs, employerCount, jobCount } = result;
  const [pendingEmployers, activeEmployers] = await Promise.all([
    getAdminEmployers({
      status: "pending",
      companyId: id,
      page: pendingPage,
      pageSize: 6,
    }),
    getAdminEmployers({
      status: "active",
      companyId: id,
      page: activePage,
      pageSize: 6,
    }),
  ]);
  const employerPages = { pendingPage, activePage };
  const site = websiteHref(company.website);
  const companyId = String(company._id);

  const stats = [
    { label: "Employers", value: employerCount, hint: "Linked accounts" },
    { label: "Jobs", value: jobCount, hint: "All listings" },
    { label: "Created", value: formatDate(company.createdAt), hint: "On the platform" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
        <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#2E46BA]/10 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E46BA] hover:text-[#1739ad]"
          >
            <ArrowLeft size={14} />
            Back to companies
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyLogo
                name={company.name}
                slug={company.slug}
                src={company.logoURL}
                size="xl"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-[#2E46BA]">
                  COMPANY
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
                  {company.name}
                </h1>
                {site ? (
                  <a
                    href={site}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-[#2E46BA]"
                  >
                    <Globe size={13} />
                    <span className="truncate">{company.website}</span>
                    <ArrowUpRight size={13} />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-gray-400">No website yet</p>
                )}
              </div>
            </div>

            <AdminCompanyActions companyId={companyId} />
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-gray-950">
              Company details
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Update the public profile. The slug stays the same so existing
              links keep working.
            </p>
            <div className="mt-6">
              <AdminCompanyForm
                companyId={companyId}
                name={company.name ?? ""}
                website={company.website ?? ""}
                about={company.about ?? ""}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-950">Jobs</h2>
              <span className="text-xs text-gray-400">
                {jobCount} {jobCount === 1 ? "role" : "roles"}
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#dcd8ea] px-4 py-10 text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#2E46BA]">
                  <Briefcase size={18} />
                </span>
                <p className="mt-3 text-sm text-gray-500">
                  This company has not posted any roles.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {jobs.map((job) => (
                  <li key={String(job._id)}>
                    <Link
                      href={`/admin/jobs/${job._id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf9ff] px-4 py-3.5 transition hover:bg-[#eef0ff]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-950">
                          {job.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {job.location}
                          {job.type ? ` · ${formatJobType(job.type)}` : ""}
                        </p>
                      </div>
                      <JobStatusBadge status={effectiveJobStatus(job)} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Pending employers
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {pendingEmployers.total} waiting
            </p>

            {pendingEmployers.employers.length === 0 ? (
              <p className="mt-6 text-sm text-gray-400">
                No pending employer accounts for this company.
              </p>
            ) : (
              <>
                <ul className="mt-5 space-y-3">
                  {pendingEmployers.employers.map((employer) => (
                    <AdminEmployerReviewCard
                      key={employer._id}
                      employer={employer}
                      showApprove
                    />
                  ))}
                </ul>
                <QueryPagination
                  page={pendingEmployers.page}
                  totalPages={pendingEmployers.totalPages}
                  hrefForPage={(page) =>
                    buildAdminCompanyDetailEmployersHref(
                      companyId,
                      employerPages,
                      "pending",
                      page,
                    )
                  }
                />
              </>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 text-lg font-semibold text-gray-950">
                Active employers
              </h2>
              <div className="shrink-0">
                <AdminAddEmployer companyId={companyId} />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {activeEmployers.total} approved
            </p>

            {activeEmployers.employers.length === 0 &&
            pendingEmployers.total === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#dcd8ea] px-4 py-8 text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#2E46BA]">
                  <Users size={18} />
                </span>
                <p className="mt-3 text-sm text-gray-500">
                  No employer accounts are linked yet.
                </p>
              </div>
            ) : activeEmployers.employers.length === 0 ? (
              <p className="mt-6 text-sm text-gray-400">
                No active employer accounts for this company.
              </p>
            ) : (
              <>
                <ul className="mt-5 space-y-3">
                  {activeEmployers.employers.map((employer) => (
                    <AdminEmployerReviewCard
                      key={employer._id}
                      employer={employer}
                    />
                  ))}
                </ul>
                <QueryPagination
                  page={activeEmployers.page}
                  totalPages={activeEmployers.totalPages}
                  hrefForPage={(page) =>
                    buildAdminCompanyDetailEmployersHref(
                      companyId,
                      employerPages,
                      "active",
                      page,
                    )
                  }
                />
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
