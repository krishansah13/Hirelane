import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JobCard from "../jobs/JobCard";
import { Job } from "@/types/JobTypes";

export default function LandingFeatured({
    jobs,
    total,
}: {
    jobs: Job[];
    total: number;
}) {
    if (jobs.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#f7f5ff]">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-wide text-gray-400">
                            LATEST OPENINGS
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                            Roles posted recently
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            {total > jobs.length
                                ? `${total.toLocaleString("en-IN")} open roles on Hirelane. Here are the newest.`
                                : "Fresh roles from teams hiring right now."}
                        </p>
                    </div>

                    <Link prefetch={false}
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E46BA] transition hover:text-[#12329c]"
                    >
                        View all jobs
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:gap-4">
                    {jobs.map((job) => (
                        <JobCard key={job._id.toString()} job={job} />
                    ))}
                </div>
            </div>
        </section>
    );
}
