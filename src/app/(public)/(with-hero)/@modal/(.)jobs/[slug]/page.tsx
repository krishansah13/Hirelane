import JobModal from "@/components/jobs/JobModal";
import { auth } from "@/auth";
import { getMyApplicationForJob } from "@/lib/application-query";
import { canEmployerViewPublicJob } from "@/lib/job-access";
import { getJobBySlug } from "@/lib/job-query";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [job, session] = await Promise.all([getJobBySlug(slug), auth()]);
  if (!job) notFound();

  if (
    session?.user?.role === "employer" &&
    !canEmployerViewPublicJob(session.user.companyId, job.companyId)
  ) {
    redirect("/employer");
  }

  const company =
    job.companyId && typeof job.companyId === "object" ? job.companyId : null;
  const jobId = String(job._id);
  const existingApplication =
    session?.user?.role === "seeker"
      ? await getMyApplicationForJob(session.user.id, jobId)
      : null;

  return (
    <JobModal
      jobId={jobId}
      slug={slug}
      title={job.title}
      description={job.description}
      location={job.location}
      type={job.type}
      isRemote={job.isRemote}
      salaryMin={job.salaryMin}
      salaryMax={job.salaryMax}
      skills={job.skills}
      requirements={job.requirements}
      companyName={company?.name}
      companySlug={company?.slug}
      companyLogo={company?.logoURL}
      existingApplication={existingApplication}
    />
  );
}
