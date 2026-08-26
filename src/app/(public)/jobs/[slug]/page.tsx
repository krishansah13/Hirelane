import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobBySlug, getPublishedJobSlugs } from "@/lib/job-query";
import { ArrowUpRight } from "lucide-react";
import { formatInr } from "@/lib/utils/format";
import ApplyForm from "@/components/ApplyForm";
import CompanyLogo from "@/components/CompanyLogo";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  const jobs = await getPublishedJobSlugs();
  return jobs.map((job: { slug: string }) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) {
    return { title: "Job Not Found" };
  }
  const company =
    job.companyId && typeof job.companyId === "object" ? job.companyId : null;

  const description: string =
    typeof job.description === "string"
      ? job.description.slice(0, 160)
      : "View this role on Hirelane";

  return {
    title: company?.name ? `${job.title} at ${company.name}` : job.title,
    description,
  };
}

export default async function JobDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }
  const jobId = String(job._id);

  const company =
    job.companyId && typeof job.companyId === "object" ? job.companyId : null;

  const jobType = job.type.charAt(0).toUpperCase() + job.type.slice(1);

  return (
    <main className="min-h-screen bg-white">
      <div className="overflow-hidden bg-gray-50 shadow-sm">
        {/* Header */}
        <section className="relative overflow-hidden bg-linear-100 from-white via-white to-indigo-200">
          <div className="relative px-6 py-12 sm:px-10 lg:py-16">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="">
                {/* Brand */}
                <div className="mb-6 flex items-center gap-3">
                  <CompanyLogo
                    name={company?.name || "Hirelane"}
                    slug={company?.slug}
                    src={company?.logoURL}
                    size="lg"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {company?.name || "Company"}
                    </p>
                    <p className="text-xs text-gray-500">HIRELANE JOBS</p>
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                  {job.title}
                </h1>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {job.location}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-gray">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    {jobType}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {job.isRemote ? "Remote" : "On-site"}
                  </span>
                </div>
              </div>

              {/* Apply button - desktop */}
              <div className="hidden w-full max-w-sm sm:block">
                <ApplyForm jobId={jobId} slug={slug} compact />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_320px] lg:py-14">
          {/* Left: About */}
          <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-950">Job Description</h2>

            <div className="mt-5 whitespace-pre-line text-[15px] leading-7 text-gray-600">
              {job.description}
            </div>
          </article>

          {/* Right column */}
          <div className="flex flex-col gap-8">
            {/* Job Details - TOP RIGHT */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-gray-950">Job details</h2>

              <dl className="mt-6 grid gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {job.location}
                  </dd>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Employment Type
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {jobType}
                  </dd>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Work Arrangement
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {job.isRemote ? "Remote" : "On-site"}
                  </dd>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Company
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {company?.name || "—"}
                  </dd>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Minimum Salary
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {formatInr(job.salaryMin)}
                    <span className="ml-1 text-xs text-gray-500">per year</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Maximum Salary
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {formatInr(job.salaryMax)}
                    <span className="ml-1 text-xs text-gray-500">per year</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <dt className="text-lg font-bold uppercase tracking-wide text-gray-700">
                    Joining date
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {job.joiningDate ? formatDate(job.joiningDate) : "Not Specified"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </section>

        {/* Mobile CTA */}
        <div className="sticky bottom-0 bg-white/95 p-4 backdrop-blur sm:hidden">
          <ApplyForm jobId={jobId} slug={slug} compact />
        </div>
      </div>
    </main>
  );
}
