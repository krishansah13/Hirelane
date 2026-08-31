import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import {
  getAdminCompanyStats,
  toAdminCompanyQuery,
} from "@/lib/admin-company-query";
import { adminCompanyQuerySchema } from "@/lib/validation";
import AdminCompanySearch from "@/components/admin/AdminCompanySearch";
import AdminAddCompany from "@/components/admin/AdminAddCompany";
import AdminCompanyResults from "@/components/admin/AdminCompanyResults";
import { QueryListFallback } from "@/components/ui/Skeleton";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const parsed = adminCompanyQuerySchema.safeParse(params);
  const query = parsed.success ? toAdminCompanyQuery(parsed.data) : { page: 1 };
  const stats = await getAdminCompanyStats();

  const statCards = [
    { label: "Total companies", value: stats.total },
    { label: "Employers", value: stats.employerCount },
    { label: "Jobs", value: stats.jobCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div>
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
        <AdminAddCompany />
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

      <Suspense
        key={JSON.stringify(query)}
        fallback={<QueryListFallback label="Loading companies" />}
      >
        <AdminCompanyResults query={query} />
      </Suspense>
    </div>
  );
}
