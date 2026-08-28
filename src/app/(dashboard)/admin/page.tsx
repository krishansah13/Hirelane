import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, Users } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getAdminUserStats } from "@/lib/admin-query";

export default async function AdminPage() {
  const user = await requireAdmin();
  const stats = await getAdminUserStats();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Welcome{user.name ? `, ${user.name}` : ""}. Manage accounts from
          Users. Job moderation and analytics will land here later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0ff] text-[#2E46BA]">
              <Users size={18} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E46BA]">
              Open
              <ArrowRight size={14} />
            </span>
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-950">
            User management
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {stats.total} accounts · {stats.suspended} suspended. Search,
            filter, and suspend seekers or employers.
          </p>
        </Link>

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0ff] text-[#2E46BA]">
              <Briefcase size={18} />
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium tracking-wide text-gray-500">
              Coming soon
            </span>
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-950">
            Job moderation
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Review posted roles, handle reports, and keep the public board
            clean.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0ff] text-[#2E46BA]">
              <BarChart3 size={18} />
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium tracking-wide text-gray-500">
              Coming soon
            </span>
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-950">
            Analytics
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Track applications, hiring activity, and platform health at a
            glance.
          </p>
        </div>
      </div>
    </div>
  );
}
