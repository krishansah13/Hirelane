import JobModal from "@/components/JobModal";
import { getJobBySlug } from "@/lib/job-query";
import { notFound } from "next/navigation";

export default async function JobModalPage({params} : {params : Promise<{slug : string}>}) {
    const {slug} = await params;
    const job = await getJobBySlug(slug);
    if(!job) notFound();

    const company = job.companyId && typeof job.companyId === "object" ? job.companyId : null;

    return(
        <JobModal 
            jobId = {String(job._id)}
            slug={slug}
            title = {job.title}
            description={job.description}
            location = {job.location}
            type = {job.type}
            isRemote={job.isRemote}
            salaryMin = {job.salaryMin}
            salaryMax = {job.salaryMax}
            companyName={company?.name}
            companySlug={company?.slug}
            companyLogo={company?.logoURL}
        />
    )
}