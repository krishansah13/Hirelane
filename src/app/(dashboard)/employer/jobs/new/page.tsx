import JobWriteForm from "@/components/jobs/JobWriteForm";
import { requireEmployer } from "@/lib/session";

export default async function NewJobPage() {
    await requireEmployer();

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-medium tracking-wide text-gray-400">EMPLOYER</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                    Post a job
                </h1>
                <p className="mt-3 max-w-xl text-sm text-gray-500">
                    Save a draft, then publish when the role is ready for the public board.
                </p>
            </div>
            <JobWriteForm mode="create" />
        </div>
    );
}