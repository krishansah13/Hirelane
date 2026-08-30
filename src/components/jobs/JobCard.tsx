import { Job } from "@/types/JobTypes";
import { Briefcase, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CompanyLogo from "../CompanyLogo";

function formatDate(date?: string | Date) {
    if (!date) return "";

    const value = new Date(date);
    const now = new Date();

    const diff = now.getTime() - value.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
        return `${Math.max(minutes, 1)}m ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    if (days < 7) {
        return `${days}d ago`;
    }

    return value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function isNew(date?: string | Date) {
    if (!date) return false;
    return (
        new Date().getTime() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000
    );
}

export default function JobCard({ job }: { job: Job }) {
    const posted = formatDate(job.createdAt);

    return (
        <Link prefetch={false} href={`/jobs/${job.slug}`} prefetch={false} className="group block">
            <article className="flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-xs transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(76,61,130,0.10)] sm:min-h-[116px] sm:items-center sm:gap-5 sm:px-6 sm:py-5">
                <CompanyLogo
                    name={job.companyId.name}
                    slug={job.companyId.slug}
                    src={job.companyId.logo || job.companyId.logoURL}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                            <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#17151c] sm:text-base">
                                {job.title}

                            </h2>
                            <div>
                                {isNew(job.createdAt) && (
                                    <span className="rounded-full bg-[#e9e9ff] px-2 py-0.5 text-[10px] font-medium text-[#4f46b5]">
                                        New
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">

                            {posted && (
                                <span className="text-[11px] text-gray-400 sm:hidden">
                                    {posted}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="mt-1 truncate text-[12px] capitalize text-gray-500 sm:hidden">
                        <span className="font-medium text-gray-700">
                            {job.companyId.name}
                        </span>
                        {[
                            job.location,
                            job.type?.replace("-", " "),
                            job.isRemote ? "Remote" : null,
                        ]
                            .filter(Boolean)
                            .map((part) => ` · ${part}`)
                            .join("")}
                    </p>

                    <div className="mt-1.5 hidden flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-500 sm:flex">
                        <span className="font-medium text-gray-700">
                            {job.companyId.name}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {job.location}
                        </span>

                        {job.type && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1 capitalize">
                                    <Briefcase size={11} />
                                    {job.type}
                                </span>
                            </>
                        )}

                        {job.isRemote && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span>Remote</span>
                            </>
                        )}
                    </div>

                    <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                        {job.type && (
                            <span className="rounded-md bg-[#f1eff7] px-2 py-1 text-[10px] font-medium capitalize text-gray-600">
                                {job.type}
                            </span>
                        )}

                        {job.isRemote && (
                            <span className="rounded-md bg-[#f1eff7] px-2 py-1 text-[10px] font-medium text-gray-600">
                                Remote
                            </span>
                        )}

                        {job.skills?.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className="rounded-md bg-[#eef0ff] px-2 py-1 text-[10px] font-medium text-[#4f46b5]"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="hidden shrink-0 items-center gap-5 sm:flex">
                    {posted && (
                        <span className="hidden text-[11px] text-gray-400 lg:block">
                            {posted}
                        </span>
                    )}

                    <span className="flex h-9 items-center gap-1.5 rounded-md px-4 text-[11px] font-medium text-[#4338a8] transition-colors group-hover:bg-[#faf9ff]">
                        View Role
                        <ArrowUpRight
                            size={13}
                            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                    </span>
                </div>
            </article>
        </Link>
    );
}
