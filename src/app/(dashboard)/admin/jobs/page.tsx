import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { getAdminJobStats, toAdminJobQuery } from "@/lib/admin-job-query";
import { adminJobQuerySchema } from "@/lib/validation";
import AdminJobSearch from "@/components/admin/AdminJobSearch";
import AdminJobResults from "@/components/admin/AdminJobResults";
import { QueryListFallback } from "@/components/ui/Skeleton";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const parsed = adminJobQuerySchema.safeParse(params);
  const query = parsed.success ? toAdminJobQuery(parsed.data) : { page: 1 };
  const stats = await getAdminJobStats();

  const statCards = [
    { label: "Total jobs", value: stats.total },
    { label: "Published", value: stats.published },
    { label: "Drafts", value: stats.draft },
    { label: "Closed / expired", value: stats.expired },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Jobs
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Review every role on the board. Search by title or company, filter by
          status, and close or remove listings that should not stay public.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <AdminJobSearch params={query} />

      <Suspense
        key={JSON.stringify(query)}
        fallback={<QueryListFallback label="Loading jobs" />}
      >
        <AdminJobResults query={query} />
      </Suspense>
    </div>
  );
}
