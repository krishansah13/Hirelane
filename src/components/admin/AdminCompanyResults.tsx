import Link from "next/link";
import { Building2 } from "lucide-react";
import {
  buildAdminCompanyEmployersHref,
  getAdminCompanies,
  type AdminCompanyQuery,
} from "@/lib/admin-company-query";
import { getAdminEmployers } from "@/lib/admin-query";
import CompanyLogo from "@/components/CompanyLogo";
import AdminCompaniesPagination from "@/components/admin/AdminCompaniesPagination";
import AdminAddCompany from "@/components/admin/AdminAddCompany";
import AdminEmployerReviewCard from "@/components/admin/AdminEmployerReviewCard";
import QueryPagination from "@/components/ui/QueryPagination";

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

export default async function AdminCompanyResults({
  query,
}: {
  query: AdminCompanyQuery;
}) {
  const [result, pendingEmployers, activeEmployers] = await Promise.all([
    getAdminCompanies(query),
    getAdminEmployers({ status: "pending", page: query.pendingPage }),
    getAdminEmployers({ status: "active", page: query.activePage }),
  ]);

  const filtersActive = Boolean(query.q);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <>
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
              prefetch={false}
              href="/admin/companies"
              className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear search
            </Link>
          ) : (
            <div className="mt-5">
              <AdminAddCompany />
            </div>
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
                <Link
                  prefetch={false}
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
                      prefetch={false}
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
                            prefetch={false}
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
                          prefetch={false}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-950">
            Pending employers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {pendingEmployers.total} waiting for approval
          </p>
          {pendingEmployers.employers.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">
              No employer accounts are waiting for review.
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
                  buildAdminCompanyEmployersHref(query, "pending", page)
                }
              />
            </>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-950">
            Active employers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeEmployers.total} approved accounts
          </p>
          {activeEmployers.employers.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">
              No active employer accounts yet.
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
                  buildAdminCompanyEmployersHref(query, "active", page)
                }
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
