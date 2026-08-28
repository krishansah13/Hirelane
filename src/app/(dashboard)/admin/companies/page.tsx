import Link from "next/link";
import { Building2 } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import {
  getAdminCompanies,
  getAdminCompanyStats,
  toAdminCompanyQuery,
} from "@/lib/admin-company-query";
import { adminCompanyQuerySchema } from "@/lib/validation";
import CompanyLogo from "@/components/CompanyLogo";
import AdminCompanySearch from "@/components/admin/AdminCompanySearch";
import AdminCompaniesPagination from "@/components/admin/AdminCompaniesPagination";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const parsed = adminCompanyQuerySchema.safeParse(params);
  const query = parsed.success ? toAdminCompanyQuery(parsed.data) : { page: 1 };

  const [stats, result] = await Promise.all([
    getAdminCompanyStats(),
    getAdminCompanies(query),
  ]);

  const statCards = [
    { label: "Total companies", value: stats.total },
    { label: "With employers", value: stats.withEmployers },
    { label: "With jobs", value: stats.withJobs },
  ];

  const filtersActive = Boolean(query.q);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Companies
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Review employer companies, inspect their jobs and accounts, and update
          or remove a listing when it should not stay on the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-medium tracking-wide text-gray-400">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <AdminCompanySearch params={query} />

      {result.companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Building2 size={22} className="text-[#2e46ba]" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            No companies found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {filtersActive
              ? "Try a different name or website."
              : "No companies have been created yet."}
          </p>
          {filtersActive ? (
            <Link
              href="/admin/companies"
              className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear search
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <p className="text-sm text-gray-500">
                Showing {rangeStart}–{rangeEnd} of {result.total}
              </p>
              {filtersActive ? (
                <Link
                  href="/admin/companies"
                  className="text-sm font-medium text-[#2E46BA] hover:text-[#12329c]"
                >
                  Clear search
                </Link>
              ) : null}
            </div>

            <ul className="divide-y divide-gray-100 lg:hidden">
              {result.companies.map((company) => (
                <li key={company._id} className="flex items-start gap-3 p-5">
                  <CompanyLogo
                    name={company.name}
                    slug={company.slug}
                    src={company.logoURL}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/companies/${company._id}`}
                      className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                    >
                      {company.name}
                    </Link>
                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {company.website}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {company.employerCount}{" "}
                      {company.employerCount === 1 ? "employer" : "employers"}
                      {" · "}
                      {company.jobCount} {company.jobCount === 1 ? "job" : "jobs"}
                      {" · "}
                      {formatDate(company.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Website</th>
                    <th className="px-6 py-3 font-medium">Employers</th>
                    <th className="px-6 py-3 font-medium">Jobs</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.companies.map((company) => (
                    <tr key={company._id} className="align-middle">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            name={company.name}
                            slug={company.slug}
                            src={company.logoURL}
                            size="sm"
                          />
                          <Link
                            href={`/admin/companies/${company._id}`}
                            className="font-semibold text-gray-950 hover:text-[#2E46BA]"
                          >
                            {company.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {company.website}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {company.employerCount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {company.jobCount}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(company.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/companies/${company._id}`}
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

          <AdminCompaniesPagination
            page={result.page}
            totalPages={result.totalPages}
            params={query}
          />
        </>
      )}
    </div>
  );
}
