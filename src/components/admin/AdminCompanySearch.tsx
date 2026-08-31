import { Search } from "lucide-react";
import type { AdminCompanyQuery } from "@/lib/admin-company-query";
import QuerySearchForm from "@/components/ui/QuerySearchForm";

const FIELD_CLASS =
  "h-11 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA]";

export default function AdminCompanySearch({
  params,
}: {
  params: AdminCompanyQuery;
}) {
  return (
    <QuerySearchForm
      key={params.q ?? ""}
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
            placeholder="Company name or website"
            className={`${FIELD_CLASS} pl-9`}
          />
        </div>
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
