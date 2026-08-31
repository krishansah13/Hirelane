import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { getAdminUserStats, toAdminUserQuery } from "@/lib/admin-query";
import { adminUserQuerySchema } from "@/lib/validation";
import AdminUserSearch from "@/components/admin/AdminUserSearch";
import AdminUserResults from "@/components/admin/AdminUserResults";
import { QueryListFallback } from "@/components/ui/Skeleton";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const parsed = adminUserQuerySchema.safeParse(params);
  const query = parsed.success ? toAdminUserQuery(parsed.data) : { page: 1 };
  const stats = await getAdminUserStats();

  const statCards = [
    { label: "Total users", value: stats.total },
    { label: "Seekers", value: stats.seekers },
    { label: "Employers", value: stats.employers },
    { label: "Pending", value: stats.pending },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Users
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Search the directory, filter by role or status, and approve pending
          employer accounts.
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

      <AdminUserSearch params={query} />

      <Suspense
        key={JSON.stringify(query)}
        fallback={<QueryListFallback label="Loading users" />}
      >
        <AdminUserResults currentUserId={admin.id} query={query} />
      </Suspense>
    </div>
  );
}
