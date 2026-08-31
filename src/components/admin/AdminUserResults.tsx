import Link from "next/link";
import { Users } from "lucide-react";
import {
  getAdminUsers,
  type AdminUserListItem,
  type AdminUserQuery,
} from "@/lib/admin-query";
import AdminUsersPagination from "@/components/admin/AdminUsersPagination";
import AdminUserStatusButton from "@/components/admin/AdminUserStatusButton";
import {
  AccountStatusBadge,
  RoleBadge,
} from "@/components/admin/AdminUserBadges";

function formatJoined(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function UserActions({
  user,
  currentUserId,
}: {
  user: AdminUserListItem;
  currentUserId: string;
}) {
  if (user._id === currentUserId) {
    return <span className="text-xs font-medium text-gray-400">You</span>;
  }

  if (user.role === "admin") {
    return <span className="text-xs font-medium text-gray-400">Protected</span>;
  }

  return <AdminUserStatusButton userId={user._id} status={user.status} />;
}

export default async function AdminUserResults({
  currentUserId,
  query,
}: {
  currentUserId: string;
  query: AdminUserQuery;
}) {
  const result = await getAdminUsers(query);
  const filtersActive = Boolean(query.q || query.role || query.status);
  const rangeStart =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const rangeEnd = Math.min(result.page * result.pageSize, result.total);

  if (result.users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Users size={22} className="text-[#2e46ba]" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-gray-900">
          No users found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {filtersActive
            ? "Try a different name, email, or filter."
            : "No accounts have been created yet."}
        </p>
        {filtersActive ? (
          <Link
            prefetch={false}
            href="/admin/users"
            className="mt-5 inline-flex rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {result.total}
          </p>
          {filtersActive ? (
            <Link
              prefetch={false}
              href="/admin/users"
              className="text-sm font-medium text-[#2E46BA] hover:text-[#12329c]"
            >
              Clear filters
            </Link>
          ) : null}
        </div>

        <ul className="divide-y divide-gray-100 lg:hidden">
          {result.users.map((user) => (
            <li key={user._id} className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-950">
                    {user.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {user.email}
                  </p>
                  {user.companyName ? (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {user.companyName}
                    </p>
                  ) : null}
                </div>
                <AccountStatusBadge status={user.status} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span className="text-xs text-gray-400">
                    Joined {formatJoined(user.createdAt)}
                  </span>
                </div>
                <UserActions user={user} currentUserId={currentUserId} />
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.users.map((user) => (
                <tr key={user._id} className="align-middle">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-950">{user.name}</p>
                    {user.companyName ? (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {user.companyName}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <AccountStatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatJoined(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <UserActions user={user} currentUserId={currentUserId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminUsersPagination
        page={result.page}
        totalPages={result.totalPages}
        params={query}
      />
    </>
  );
}
