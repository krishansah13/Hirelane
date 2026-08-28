import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getAdminJobById } from "@/lib/admin-job-query";
import { formatInr, formatJobType } from "@/lib/utils/format";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import AdminJobActions from "@/components/admin/AdminJobActions";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const result = await getAdminJobById(id);

  if (!result) {
    notFound();
  }

  const { job, applicationCount, status } = result;
  const company =
    job.companyId && typeof job.companyId === "object" ? job.companyId : null;
  const poster =
    job.postedById && typeof job.postedById === "object" ? job.postedById : null;

  const details = [
    { label: "Company", value: company?.name ?? "—" },
    { label: "Location", value: job.location ?? "—" },
    { label: "Employment type", value: formatJobType(job.type) },
    { label: "Work arrangement", value: job.isRemote ? "Remote" : "On-site" },
    { label: "Salary", value: `${formatInr(job.salaryMin)} – ${formatInr(job.salaryMax)}` },
    { label: "Joining date", value: job.joiningDate ? formatDate(job.joiningDate) : "Not specified" },
    { label: "Created", value: formatDate(job.createdAt) },
    { label: "Published", value: formatDate(job.publishedAt) },
    { label: "Expires", value: formatDate(job.expiresAt) },
    { label: "Applications", value: String(applicationCount) },
    { label: "Posted by", value: poster?.name ? `${poster.name}${poster.email ? ` · ${poster.email}` : ""}` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/admin/jobs"
          className="text-sm font-medium text-[#2e46ba] hover:underline"
        >
          ← Back to jobs
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-gray-400">
              ADMIN
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {job.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {company?.name ?? "Company"}
              {job.location ? ` · ${job.location}` : ""}
            </p>
            <div className="mt-3">
              <JobStatusBadge status={status} />
            </div>
          </div>
          <AdminJobActions
            jobId={String(job._id)}
            canClose={status === "published"}
            redirectToList
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-gray-950">Job description</h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
            {job.description || "No description provided."}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">Details</h2>
            <dl className="mt-4 space-y-3">
              {details.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium tracking-wide text-gray-400">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {status === "published" && job.slug ? (
            <Link
              href={`/jobs/${job.slug}`}
              className="block rounded-2xl bg-[#eef0ff] px-5 py-4 text-sm font-medium text-[#2e46ba] transition hover:bg-indigo-100"
            >
              View public page
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
