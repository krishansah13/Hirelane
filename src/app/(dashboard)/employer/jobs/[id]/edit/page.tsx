import JobWriteForm from "@/components/JobWriteForm";
import { getCompanyJobById } from "@/lib/employer-query";
import { requireEmployer } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await requireEmployer();
    const job = await getCompanyJobById(user.companyId, id);

    if (!job) {
        return notFound();
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
                    EMPLOYER
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                    Edit job
                </h1>
                <p className="mt-3 max-w-xl text-sm text-gray-500">
                    Save changes, or publish this role to the public board.
                </p>
            </div>
            <JobWriteForm
                mode="edit"
                jobId={String(job._id)}
                initial={{
                    title: job.title ?? "",
                    description: job.description ?? "",
                    location: job.location ?? "",
                    type: job.type ?? "full-time",
                    isRemote: Boolean(job.isRemote),
                    salaryMin: job.salaryMin ?? 0,
                    salaryMax: job.salaryMax ?? 0,
                    expiresAt:
                        job.expiresAt instanceof Date
                            ? job.expiresAt.toISOString()
                            : String(job.expiresAt ?? ""),
                    status: job.status,
                }}
            />
        </div>
    );
}