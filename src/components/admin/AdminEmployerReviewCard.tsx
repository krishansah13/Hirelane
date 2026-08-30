import Link from "next/link";
import type { AdminEmployerListItem } from "@/lib/admin-query";
import AdminRemoveEmployer from "@/components/admin/AdminRemoveEmployer";
import AdminUserStatusButton from "@/components/admin/AdminUserStatusButton";
import { AccountStatusBadge } from "@/components/admin/AdminUserBadges";

export default function AdminEmployerReviewCard({
  employer,
  showApprove = false,
}: {
  employer: AdminEmployerListItem;
  showApprove?: boolean;
}) {
  return (
    <li className="rounded-2xl bg-[#fbf9ff] px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-xs font-semibold text-[#2E46BA]">
            {(employer.name || "E").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-950">
              {employer.name}
            </p>
            <p className="truncate text-xs text-gray-500">{employer.email}</p>
            {employer.companyId ? (
              <Link
                prefetch={false}
                href={`/admin/companies/${employer.companyId}`}
                className="mt-1 block truncate text-xs font-medium text-[#2E46BA] hover:text-[#12329c]"
              >
                {employer.companyName ?? "View company"}
              </Link>
            ) : (
              <p className="mt-1 text-xs text-gray-400">No company linked</p>
            )}
            <div className="mt-2">
              <AccountStatusBadge status={employer.status} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {showApprove ? (
            <AdminUserStatusButton userId={employer._id} status="pending" />
          ) : null}
          {employer.companyId ? (
            <AdminRemoveEmployer
              userId={employer._id}
              companyId={employer.companyId}
              name={employer.name || "this employer"}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
