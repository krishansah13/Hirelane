import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getAdminCompanyById } from "@/lib/admin-company-query";
import CompanyLogo from "@/components/CompanyLogo";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import AdminCompanyForm from "@/components/admin/AdminCompanyForm";
import AdminCompanyActions from "@/components/admin/AdminCompanyActions";
import AdminAddEmployer from "@/components/admin/AdminAddEmployer";
import AdminRemoveEmployer from "@/components/admin/AdminRemoveEmployer";
import { effectiveJobStatus } from "@/lib/job-status";

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

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const result = await getAdminCompanyById(id);

  if (!result) {
    notFound();
  }

  const { company, employers, jobs, employerCount, jobCount } = result;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/admin/companies"
          className="text-sm font-medium text-[#2e46ba] hover:underline"
        >
          ← Back to companies
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <CompanyLogo
              name={company.name}
              slug={company.slug}
              src={company.logoURL}
              size="lg"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-gray-400">
                ADMIN
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                {company.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {employerCount} {employerCount === 1 ? "employer" : "employers"}
                {" · "}
                {jobCount} {jobCount === 1 ? "job" : "jobs"}
                {" · Created "}
                {formatDate(company.createdAt)}
              </p>
            </div>
          </div>
          <AdminCompanyActions companyId={String(company._id)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-gray-950">
              Company details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the public company profile. The slug stays the same so
              existing links keep working.
            </p>
            <div className="mt-5">
              <AdminCompanyForm
                companyId={String(company._id)}
                name={company.name ?? ""}
                website={company.website ?? ""}
                about={company.about ?? ""}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-gray-950">Jobs</h2>
            {jobs.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                This company has not posted any roles.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {jobs.map((job) => (
                  <li
                    key={String(job._id)}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/jobs/${job._id}`}
                        className="font-medium text-gray-950 hover:text-[#2E46BA]"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {job.location}
                        {job.type ? ` · ${job.type}` : ""}
                      </p>
                    </div>
                    <JobStatusBadge status={effectiveJobStatus(job)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-950">Employers</h2>
              <AdminAddEmployer companyId={String(company._id)} />
            </div>
            {employers.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                No employer accounts are linked to this company.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {employers.map((employer) => (
                  <li
                    key={String(employer._id)}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-950">
                        {employer.name}
                      </p>
                      <p className="text-xs text-gray-500">{employer.email}</p>
                    </div>
                    <AdminRemoveEmployer
                      userId={String(employer._id)}
                      companyId={String(company._id)}
                      name={employer.name ?? "this employer"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
