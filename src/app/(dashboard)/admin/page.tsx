import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { getAdminUserStats } from "@/lib/admin-query";
import { getAdminJobStats } from "@/lib/admin-job-query";
import { getAdminCompanyStats } from "@/lib/admin-company-query";

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const [userStats, jobStats, companyStats] = await Promise.all([
    getAdminUserStats(),
    getAdminJobStats(),
    getAdminCompanyStats(),
  ]);
  const greeting = firstName(user.name);

  const stats = [
    {
      label: "Accounts",
      value: userStats.total,
      hint: `${userStats.seekers} seekers · ${userStats.employers} employers`,
    },
    {
      label: "Live jobs",
      value: jobStats.published,
      hint: `${jobStats.draft} drafts · ${jobStats.expired} expired`,
    },
    {
      label: "Companies",
      value: companyStats.total,
      hint: `${companyStats.withJobs} with open listings`,
    },
    {
      label: "Suspended",
      value: userStats.suspended,
      hint: "Need a closer look",
    },
  ];

  const panels = [
    {
      href: "/admin/users",
      icon: Users,
      title: "User management",
      body: `${userStats.total} accounts · ${userStats.suspended} suspended. Search, filter, and suspend seekers or employers.`,
    },
    {
      href: "/admin/jobs",
      icon: Briefcase,
      title: "Job management",
      body: `${jobStats.total} jobs · ${jobStats.published} live. Review, close, or remove listings from every employer.`,
    },
    {
      href: "/admin/companies",
      icon: Building2,
      title: "Company management",
      body: `${companyStats.total} companies · ${companyStats.withJobs} with jobs. Review profiles and clean up employer listings.`,
    },
  ];

  return (
    <div className="mx-auto max-w-full space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-400 shadow-sm">
        <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#2E46BA]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10"> 
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              A quick look across accounts, jobs, and companies → then jump
              into the queue that needs you.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#eef0ff] px-4 py-2 text-sm font-medium text-[#2E46BA]">
            <Shield size={15} />
            Platform admin
          </span>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <section className="space-y-3">
        <div className="px-1">
          <h2 className="text-sm font-semibold text-gray-950">Manage Hirelane</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {panels.map((panel) => {
            const Icon = panel.icon;

            return (
              <Link
                key={panel.href}
                href={panel.href}
                className="group rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(76,61,130,0.10)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0ff] text-[#2E46BA]">
                    <Icon size={18} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4338a8] transition-colors group-hover:text-[#2E46BA]">
                    Open
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
                <h2 className="mt-4 text-base font-semibold text-gray-950">
                  {panel.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {panel.body}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
