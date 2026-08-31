import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { requireSeeker } from "@/lib/session";
import {
  getMyApplicationStats,
  toSeekerApplicationQuery,
} from "@/lib/application-query";
import { seekerApplicationQuerySchema } from "@/lib/validation";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import DashboardApplicationResults from "@/components/dashboard/DashboardApplicationResults";
import { QueryListFallback } from "@/components/ui/Skeleton";

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSeeker();
  const params = await searchParams;
  const parsed = seekerApplicationQuerySchema.safeParse(params);
  const query = parsed.success ? toSeekerApplicationQuery(parsed.data) : { page: 1 };
  const stats = await getMyApplicationStats(user.id);

  const greeting = firstName(user.name);
  const statCards = [
    { label: "In progress", value: stats.active, hint: "Still moving" },
    { label: "Interviews", value: stats.interview, hint: "On the calendar" },
    { label: "Offers", value: stats.offer, hint: "Ready to decide" },
    { label: "Total applied", value: stats.total, hint: "All roles" },
  ];

  return (
    <div className="mx-auto  space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Your applications
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Track every role you have applied to and see where it sits in the
              pipeline.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Find jobs
            <ArrowUpRight size={15} />
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

      <DashboardSearch params={query} />

      <Suspense
        key={JSON.stringify(query)}
        fallback={<QueryListFallback label="Loading applications" />}
      >
        <DashboardApplicationResults userId={user.id} query={query} />
      </Suspense>
    </div>
  );
}
