import { Search } from "lucide-react";
import type { AdminUserQuery } from "@/lib/admin-query";
import QuerySearchForm from "@/components/ui/QuerySearchForm";

const FIELD_CLASS =
  "h-11 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA]";

export default function AdminUserSearch({
  params,
}: {
  params: AdminUserQuery;
}) {
  return (
    <QuerySearchForm
      key={`${params.q ?? ""}-${params.role ?? ""}-${params.status ?? ""}`}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:p-5"
    >
      <label className="min-w-0 flex-1">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          Search
        </span>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#484855]"
          />
          <input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Name or email"
            className={`${FIELD_CLASS} pl-9`}
          />
        </div>
      </label>

      <label className="sm:w-40">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          Role
        </span>
        <select name="role" defaultValue={params.role ?? ""} className={FIELD_CLASS}>
          <option value="">All roles</option>
          <option value="seeker">Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label className="sm:w-40">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          Status
        </span>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className={FIELD_CLASS}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </label>

      <button
        type="submit"
        className="h-11 shrink-0 rounded-xl bg-[#1739ad] px-5 text-sm font-semibold text-white transition hover:bg-[#12329c]"
      >
        Search
      </button>
    </QuerySearchForm>
  );
}
