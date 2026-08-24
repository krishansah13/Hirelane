import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireSeeker } from "@/lib/session";
import { getMyApplicationById } from "@/lib/application-query";
import ApplicationStageHistory from "@/components/ApplicationStageHistory";
import StageBadge from "@/components/StageBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatJobType } from "@/lib/utils/format";

function formatDate(value?: string | Date) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HistoryFallback() {
  return (
    <ol className="space-y-5" aria-busy="true">
      <span className="sr-only">Loading stage history</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex gap-3">
          <Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" variant="brand" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" variant="subtle" />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSeeker();
  const application = await getMyApplicationById(user.id, id);

  if (!application) notFound();

  const job =
    application.jobId && typeof application.jobId === "object"
      ? application.jobId
      : null;
  const company =
    job?.companyId && typeof job.companyId === "object"
      ? job.companyId
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#2e46ba] hover:underline"
        >
          ← Back to applications
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-400">
              APPLICATION
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {job?.title ?? "Role unavailable"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {company?.name ?? "Company"}
              {job?.location ? ` · ${job.location}` : ""}
              {job?.type ? ` · ${formatJobType(job.type)}` : ""}
            </p>
          </div>
          <StageBadge stage={application.stage} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-400">
              Applied
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(application.appliedAt)}
            </dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-400">
              Last stage change
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(application.stageChangedAt)}
            </dd>
          </div>
        </dl>

        {job?.slug && (
          <Link
            href={`/jobs/${job.slug}`}
            className="mt-5 inline-flex text-sm font-medium text-[#2e46ba] hover:underline"
          >
            View job posting
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-950">Application</h2>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Resume
              </p>
              {application.resumeURL ? (
                <a
                  href={application.resumeURL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex font-medium text-[#2e46ba] hover:underline"
                >
                  Open PDF
                </a>
              ) : (
                <p className="mt-1 text-gray-500">—</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Cover note
              </p>
              <p className="mt-1 whitespace-pre-line text-gray-600">
                {application.coverNote?.trim() || "No cover note provided."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-950">Stage history</h2>
          <div className="mt-4">
            <Suspense fallback={<HistoryFallback />}>
              <ApplicationStageHistory
                userId={user.id}
                applicationId={id}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}