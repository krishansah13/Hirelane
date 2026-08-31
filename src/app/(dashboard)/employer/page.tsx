import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle, Sparkles } from "lucide-react";
import { requireEmployer } from "@/lib/session";
import {
  getCompanyJobStats,
  toEmployerJobQuery,
} from "@/lib/employer-query";
import { employerJobQuerySchema } from "@/lib/validation";
import EmployerJobSearch from "@/components/employer/EmployerJobSearch";
import EmployerJobResults from "@/components/employer/EmployerJobResults";
import { QueryListFallback } from "@/components/ui/Skeleton";

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

export default async function EmployerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireEmployer();
  const params = await searchParams;
  const parsed = employerJobQuerySchema.safeParse(params);
  const query = parsed.success ? toEmployerJobQuery(parsed.data) : { page: 1 };
  const stats = await getCompanyJobStats(user.companyId);

  const greeting = firstName(user.name);
  const statCards = [
    { label: "Live", value: stats.live, hint: "Open to applicants" },
    { label: "Drafts", value: stats.draft, hint: "Still in progress" },
    { label: "Expired", value: stats.expired, hint: "Need a refresh" },
    { label: "Total roles", value: stats.total, hint: "All listings" },
  ];

  return (
    <div className="mx-auto max-w-full space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-full">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Posted roles
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Manage drafts and published roles for your company from one
              pipeline.
            </p>
          </div>

          <Link
            href="/employer/jobs/new"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Post a job
            <PlusCircle size={15} />
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
          >
            <dt className="text-xs font-medium tracking-wide text-gray-400">
              {stat.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {stat.value}
            </dd>
            <p className="mt-1 text-xs text-gray-400">{stat.hint}</p>
          </div>
        ))}
      </dl>

      <EmployerJobSearch params={query} />

      <Suspense
        key={JSON.stringify(query)}
        fallback={<QueryListFallback label="Loading roles" />}
      >
        <EmployerJobResults companyId={user.companyId} query={query} />
      </Suspense>
    </div>
  );
}
