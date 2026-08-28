import type { AccountStatus, UserRole } from "@/lib/roles";
import { formatRoleName } from "@/lib/roles";

const ROLE_STYLES: Record<UserRole, string> = {
  seeker: "bg-indigo-50 text-indigo-700",
  employer: "bg-sky-50 text-sky-800",
  admin: "bg-[#eef0ff] text-[#2E46BA]",
};

const STATUS_STYLES: Record<AccountStatus, string> = {
  active: "bg-emerald-50 text-emerald-800",
  suspended: "bg-rose-50 text-rose-700",
};

export function RoleBadge({ role }: { role: UserRole | string }) {
  const key = role === "employer" || role === "admin" ? role : "seeker";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLES[key]}`}
    >
      {formatRoleName(key)}
    </span>
  );
}

export function AccountStatusBadge({
  status,
}: {
  status: AccountStatus | string;
}) {
  const key = status === "suspended" ? "suspended" : "active";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[key]}`}
    >
      {key === "suspended" ? "Suspended" : "Active"}
    </span>
  );
}
