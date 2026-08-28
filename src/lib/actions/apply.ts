"use server";

import { auth } from "@/auth";
import { applySchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import Job from "../models/Job";
import Application from "../models/Application";
import { publicJobFilter } from "../job-status";
import { isUserActive } from "../session";

export type ApplyState = {
  ok: boolean;
  error?: string;
};

export async function applyToJob(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "You must be signed in to apply!",
    };
  }
  if (session.user.role !== "seeker") {
    return {
      ok: false,
      error: "Only Seekers can apply for jobs",
    };
  }
  if (!(await isUserActive(session.user.id))) {
    return {
      ok: false,
      error: "This account has been suspended",
    };
  }

  const parsed = applySchema.safeParse({
    jobId: formData.get("jobId"),
    resumeURL: formData.get("resumeURL"),
    coverNote: formData.get("coverNote") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid application data",
    };
  }
  const { jobId, resumeURL, coverNote } = parsed.data;
  try {
    await connectToDatabase();
    const job = await Job.findOne({
      _id: jobId,
      ...publicJobFilter(),
    }).select("_id");

    if (!job) {
      return {
        ok: false,
        error: "This job is not available",
      };
    }
    const now = new Date();
    const existing = await Application.findOne({
        jobId,
        userId: session.user.id,
      }).select("_id");
      
      if (existing) {
        return {
          ok: false,
          error: "You have already applied to this job",
        };
      }
    await Application.create({
      jobId,
      userId: session.user.id,
      resumeURL,
      coverNote: coverNote?.trim() || undefined,
      stage: "applied",
      appliedAt: now,
      stageChangedAt: now,
      stageHistory: [
        {
          stage: "applied",
          changedAt: now,
        },
      ],
    });

    return { ok: true };
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (
            error as {
              code?: number;
            }
          ).code
        : undefined;
    if (code === 11000) {
      return {
        ok: false,
        error: "You have already applied to this job",
      };
    }
    console.error("Apply failed", error);
    return {
      ok: false,
      error: "Could not submit application",
    };
  }
}
