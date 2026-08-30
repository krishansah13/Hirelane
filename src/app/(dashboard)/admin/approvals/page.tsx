import Link from "next/link";
import { UserCheck } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getAdminEmployers, getAdminUserStats } from "@/lib/admin-query";
import AdminEmployerReviewCard from "@/components/admin/AdminEmployerReviewCard";
import QueryPagination from "@/components/ui/QueryPagination";

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [stats, result] = await Promise.all([
    getAdminUserStats(),
    getAdminEmployers({ status: "pending", page }),
  ]);

  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Account approvals
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Review employer signups. Approve an account to send a confirmation
          email, or remove it if it should not stay on Hirelane.
        </p>
        <p className="mt-3 text-sm text-gray-400">
          {stats.pending} waiting for review
        </p>
      </div>

      {result.employers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <UserCheck size={22} className="text-[#2e46ba]" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            No pending employers
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            New employer signups will show up here until you approve them.
          </p>
          <Link
            prefetch={false}
            href="/admin"
            className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to admin
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {result.total}
          </p>
          <ul className="mt-4 space-y-3">
            {result.employers.map((employer) => (
              <AdminEmployerReviewCard
                key={employer._id}
                employer={employer}
                showApprove
              />
            ))}
          </ul>
          <QueryPagination
            page={result.page}
            totalPages={result.totalPages}
            hrefForPage={(nextPage) =>
              nextPage > 1
                ? `/admin/approvals?page=${nextPage}`
                : "/admin/approvals"
            }
          />
        </div>
      )}
    </div>
  );
}
