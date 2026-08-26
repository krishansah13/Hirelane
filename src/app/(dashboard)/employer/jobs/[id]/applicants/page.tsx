import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/session";
import { getJobApplicants } from "@/lib/employer-query";
import { STAGE_ORDER } from "@/lib/stage-transitions";
import StageBadge from "@/components/StageBadge";
import StageMoveForm from "@/components/StageMoveForm";

function formatDate(value?: string | Date | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default async function JobApplicantsPage({
    params
}: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await requireEmployer();
    const data = await getJobApplicants(user.companyId, id);

    if (!data) {
        notFound();
    }

    const grouped = Object.fromEntries(
        STAGE_ORDER.map((stage) => [stage, [] as typeof data.applications]),
    ) as Record<(typeof STAGE_ORDER)[number], typeof data.applications>;

    for (const application of data.applications) {
        const stage = (application.stage ?? "applied") as (typeof STAGE_ORDER)[number];
        (grouped[stage] ?? grouped.applied).push(application);
      }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <Link
                    href="/employer"
                    className="text-sm font-medium text-[#2e46ba] hover:underline"
                >
                    ← Back to roles
                </Link>
                <p className="mt-4 text-xs font-medium tracking-wide text-gray-400">
                    PIPELINE
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                    {data.job.title}
                </h1>
                <p className="mt-3 text-sm text-gray-500">
                    {data.applications.length} applicant
                    {data.applications.length === 1 ? "" : "s"}
                </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
                {STAGE_ORDER.map((stage) => (
                    <section key={stage} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <StageBadge stage={stage} />
                            <span className="text-xs text-gray-400">
                                {grouped[stage].length}
                            </span>
                        </div>
                        <ul className="mt-4 space-y-3">
                            {grouped[stage].length === 0 ? (
                                <li className="text-xs text-gray-400">None</li>
                            ) : (
                                grouped[stage].map((application) => {
                                    const seeker =
                                        application.userId &&
                                            typeof application.userId === "object"
                                            ? application.userId
                                            : null;
                                    return (
                                        <li
                                            key={String(application._id)}
                                            className="rounded-xl border border-gray-100 p-3"
                                        >
                                            <div className="flex items-start gap-2">
                                                {seeker?.image ? (
                                                    <img
                                                        src={seeker.image}
                                                        alt=""
                                                        className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : null}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-950">
                                                        {seeker?.name ?? "Applicant"}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {seeker?.email ?? "—"}
                                                    </p>
                                                    {seeker?.mobile ? (
                                                        <p className="truncate text-xs text-gray-500">
                                                            {seeker.mobile}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Applied {formatDate(application.appliedAt)}
                                            </p>
                                            {application.resumeURL ? (
                                                <a
                                                    href={application.resumeURL}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-block text-xs font-medium text-[#2e46ba] hover:underline"
                                                >
                                                    Resume
                                                </a>
                                            ) : null}
                                            {application.coverNote ? (
                                                <p className="mt-2 line-clamp-3 text-xs text-gray-600">
                                                    {application.coverNote}
                                                </p>
                                            ) : null}
                                            <div className="mt-3">
                                                <StageMoveForm
                                                    applicationId={String(application._id)}
                                                    currentStage={application.stage ?? "applied"}
                                                />
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
