"use client";
import { formatInr, formatJobType } from "@/lib/utils/format";
import { ArrowUpRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ApplyForm from "../ApplyForm";
import CompanyLogo from "../CompanyLogo";

type JobModalProps = {
  jobId: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  type?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  requirements?: string;
  companyName?: string;
  companySlug?: string;
  companyLogo?: string;
  existingApplication?: { id: string; stage: string } | null;
};
export default function JobModal({
  jobId,
  slug,
  title,
  description,
  location,
  type,
  isRemote,
  salaryMin,
  salaryMax,
  skills,
  requirements,
  companyName,
  companySlug,
  companyLogo,
  existingApplication = null,
}: JobModalProps) {
  const router = useRouter();

  function close() {
    router.back();
  }
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-modal-title"
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <CompanyLogo
            name={companyName || "Company"}
            slug={companySlug}
            src={companyLogo}
            size="md"
          />
          <p className="text-sm font-semibold text-gray-500">
            {companyName || "Company"}
          </p>
        </div>

        <h2
          id="job-modal-title"
          className="mt-2 pr-10 text-2xl font-bold tracking-tight text-gray-950"
        >
          {title}
        </h2>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="rounded-full bg-gray-100 px-3 py-1">{location}</span>
          <span className="rounded-full bg-indigo-50 px-3 py-1">
            {formatJobType(type)}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            {isRemote ? "Remote" : "On-site"}
          </span>
          {(skills ?? []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#eef0ff] px-3 py-1 text-[#2e46ba]"
            >
              {skill}
            </span>
          ))}
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="text-xs uppercase tracking-wide text-gray-400">
              Min salary
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatInr(salaryMin)}
            </dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <dt className="text-xs uppercase tracking-wide text-gray-400">
              Max salary
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatInr(salaryMax)}
            </dd>
          </div>
        </dl>
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-950">Job Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
            {description}
          </p>
        </div>
        {requirements ? (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-950">Requirements</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
              {requirements}
            </p>
          </div>
        ) : null}
        {(skills ?? []).length > 0 ? (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-950">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#eef0ff] px-3 py-1.5 text-xs font-medium text-[#2e46ba]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <ApplyForm
            jobId={jobId}
            slug={slug}
            compact
            existingApplication={existingApplication}
          />

          <a
            href={`/jobs/${slug}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-[#4338a8] transition hover:bg-[#faf9ff]"
          >
            View full details
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
