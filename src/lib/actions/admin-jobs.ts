"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Job from "@/lib/models/Job";
import Application from "@/lib/models/Application";
import { connectToDatabase } from "@/lib/utils/db";
import { isUserActive } from "@/lib/session";
import { jobIdSchema } from "@/lib/validation";
import { revalidateJobBoard } from "@/lib/cache";
import { effectiveJobStatus } from "@/lib/job-status";

export type AdminJobActionState = {
  ok: boolean;
  error?: string;
};

async function requireAdminActor() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Only admins can manage jobs" as const };
  }

  if (!(await isUserActive(session.user.id))) {
    return { error: "This account has been suspended" as const };
  }

  return { userId: session.user.id };
}

export async function closeAdminJob(
  _prev: AdminJobActionState,
  formData: FormData,
): Promise<AdminJobActionState> {
  const actor = await requireAdminActor();
  if ("error" in actor) {
    return { ok: false, error: actor.error };
  }

  const parsed = jobIdSchema.safeParse({ jobId: formData.get("jobId") });
  if (!parsed.success) {
    return { ok: false, error: "Invalid job" };
  }

  try {
    await connectToDatabase();

    const job = await Job.findById(parsed.data.jobId);
    if (!job) {
      return { ok: false, error: "Job not found" };
    }

    if (effectiveJobStatus(job) !== "published") {
      return { ok: false, error: "Only published jobs can be closed" };
    }

    job.status = "expired";
    job.expiresAt = new Date();
    await job.save();

    revalidateJobBoard(job.slug);
    revalidatePath("/admin");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job._id}`);

    return { ok: true };
  } catch (error) {
    console.error("Failed to close job", error);
    return { ok: false, error: "Could not close this job. Try again." };
  }
}

export async function deleteAdminJob(
  _prev: AdminJobActionState,
  formData: FormData,
): Promise<AdminJobActionState> {
  const actor = await requireAdminActor();
  if ("error" in actor) {
    return { ok: false, error: actor.error };
  }

  const parsed = jobIdSchema.safeParse({ jobId: formData.get("jobId") });
  if (!parsed.success) {
    return { ok: false, error: "Invalid job" };
  }

  try {
    await connectToDatabase();

    const job = await Job.findById(parsed.data.jobId);
    if (!job) {
      return { ok: false, error: "Job not found" };
    }

    const slug = job.slug;
    const jobId = job._id;

    await Application.deleteMany({ jobId });
    await job.deleteOne();

    revalidateJobBoard(slug);
    revalidatePath("/admin");
    revalidatePath("/admin/jobs");
  } catch (error) {
    console.error("Failed to delete job", error);
    return { ok: false, error: "Could not remove this job. Try again." };
  }

  if (formData.get("redirectTo") === "list") {
    redirect("/admin/jobs");
  }

  return { ok: true };
}
