import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Inbox,
  MapPin,
  Sparkles,
} from "lucide-react";
import { requireSeeker } from "@/lib/session";
import { getMyApplications } from "@/lib/application-query";
import StageBadge from "@/components/StageBadge";
import CompanyLogo from "@/components/CompanyLogo";
import { formatJobType } from "@/lib/utils/format";

const PIPELINE = ["applied", "screening", "interview", "offer"] as const;

function formatDate(value?: string | Date) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

function StageRail({ stage }: { stage: string }) {
  const rejected = stage === "rejected";
  const currentIndex = PIPELINE.indexOf(stage as (typeof PIPELINE)[number]);

  return (
    <div
      className="mt-4 flex items-center gap-1"
      aria-hidden
    >
      {PIPELINE.map((step, index) => (
        <span
          key={step}
          className={`h-1.5 flex-1 rounded-full ${rejected
              ? "bg-rose-100"
              : currentIndex >= 0 && index <= currentIndex
                ? "bg-[#2E46BA]"
                : "bg-gray-100"
            }`}
        />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireSeeker();
  const applications = await getMyApplications(user.id);
  const greeting = firstName(user.name);

  const counts = {
    total: applications.length,
    active: applications.filter(
      (application) =>
        application.stage !== "rejected" && application.stage !== "offer",
    ).length,
    interview: applications.filter(
      (application) => application.stage === "interview",
    ).length,
    offer: applications.filter((application) => application.stage === "offer")
      .length,
  };

  const stats = [
    { label: "In progress", value: counts.active, hint: "Still moving" },
    { label: "Interviews", value: counts.interview, hint: "On the calendar" },
    { label: "Offers", value: counts.offer, hint: "Ready to decide" },
    { label: "Total applied", value: counts.total, hint: "All roles" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-100 from-white via-white to-indigo-200 shadow-sm">
        <div className="pointer-events-none absolute -right-16 top-6 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#2E46BA]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Welcome back, ${greeting}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
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

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#dcd8ea] bg-white px-6 py-14 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0ff] text-[#2E46BA]">
            <Inbox size={22} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            No applications yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Browse open roles and submit your first application. Your pipeline
            will show up here.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
          >
            Find jobs
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold text-gray-950">
              Recent activity
            </h2>
            <p className="text-xs text-gray-400">
              {applications.length}{" "}
              {applications.length === 1 ? "role" : "roles"}
            </p>
          </div>

          <ul className="space-y-3">
            {applications.map((application) => {
              const job =
                application.jobId && typeof application.jobId === "object"
                  ? application.jobId
                  : null;
              const company =
                job?.companyId && typeof job.companyId === "object"
                  ? job.companyId
                  : null;

              return (
                <li key={String(application._id)}>
                  <Link
                    href={`/dashboard/applications/${application._id}`}
                    className="group block rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(76,61,130,0.10)] sm:p-5"
                  >
                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                      <CompanyLogo
                        name={company?.name || "Company"}
                        slug={company?.slug}
                        src={company?.logoURL}
                        size="md"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-tight text-gray-950">
                              {job?.title ?? "Role unavailable"}
                            </h3>
                            <p className="mt-1 truncate text-sm text-gray-500">
                              <span className="font-medium text-gray-700">
                                {company?.name ?? "Company"}
                              </span>
                            </p>
                          </div>
                          <StageBadge stage={application.stage} />
                        </div>

                        <div className="mt-2 hidden flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 sm:flex">
                          {job?.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} />
                              {job.location}
                            </span>
                          ) : null}
                          {job?.type ? (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Briefcase size={11} />
                                {formatJobType(job.type)}
                              </span>
                            </>
                          ) : null}
                          {job?.isRemote ? (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Remote</span>
                            </>
                          ) : null}
                          <span className="text-gray-300">•</span>
                          <span>Applied {formatDate(application.appliedAt)}</span>
                        </div>

                        <p className="mt-2 text-xs text-gray-400 sm:hidden">
                          Applied {formatDate(application.appliedAt)}
                        </p>

                        <StageRail stage={application.stage} />
                      </div>

                      <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-[#4338a8] transition-colors group-hover:text-[#2E46BA] sm:inline-flex">
                        View
                        <ArrowUpRight
                          size={13}
                          className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
