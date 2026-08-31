import Link from "next/link";
import type { AdminEmployerListItem } from "@/lib/admin-query";
import AdminRemoveEmployer from "@/components/admin/AdminRemoveEmployer";
import AdminUserStatusButton from "@/components/admin/AdminUserStatusButton";
import { AccountStatusBadge } from "@/components/admin/AdminUserBadges";

export default function AdminEmployerReviewCard({
  employer,
  showApprove = false,
  showCompanyLink = true,
}: {
  employer: AdminEmployerListItem;
  showApprove?: boolean;
  showCompanyLink?: boolean;
}) {
  const companyId = employer.companyId;
  const canRemove = Boolean(companyId);
  const hasActions = showApprove || canRemove;

  return (
    <li className="rounded-2xl bg-[#fbf9ff] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-xs font-semibold text-[#2E46BA]">
          {(employer.name || "E").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-gray-950">
              {employer.name}
            </p>
            <AccountStatusBadge status={employer.status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {employer.email}
          </p>
          {showCompanyLink ? (
            employer.companyId ? (
              <Link
                prefetch={false}
                href={`/admin/companies/${employer.companyId}`}
                className="mt-1 block truncate text-xs font-medium text-[#2E46BA] hover:text-[#12329c]"
              >
                {employer.companyName ?? "View company"}
              </Link>
            ) : (
              <p className="mt-1 text-xs text-gray-400">No company linked</p>
            )
          ) : null}
        </div>
      </div>

      {hasActions ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-[#eeeaf8] pt-3 sm:flex-row">
          {showApprove ? (
            <AdminUserStatusButton
              userId={employer._id}
              status="pending"
              stretch
            />
          ) : null}
          {companyId ? (
            <AdminRemoveEmployer
              userId={employer._id}
              companyId={companyId}
              name={employer.name || "this employer"}
              stretch
            />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
