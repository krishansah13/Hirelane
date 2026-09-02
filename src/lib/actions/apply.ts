"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { applySchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import Job from "../models/Job";
import Application from "../models/Application";
import { publicJobFilter } from "../job-status";
import { isUserActive } from "../session";
import { getMyApplicationForJob } from "../application-query";
import {
  createSeekerResume,
  getSeekerResume,
} from "../resume-query";
import { labelFromFilename } from "../utils/resume";

export type ApplyState = {
  ok: boolean;
  error?: string;
};

function emptyToUndefined(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export async function getMyJobApplicationStatus(jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "seeker") return null;
  return getMyApplicationForJob(session.user.id, jobId);
}

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
    resumeURL: emptyToUndefined(formData.get("resumeURL")),
    resumeId: emptyToUndefined(formData.get("resumeId")),
    coverNote: emptyToUndefined(formData.get("coverNote")),
    saveResume: emptyToUndefined(formData.get("saveResume")),
    resumeLabel: emptyToUndefined(formData.get("resumeLabel")),
    originalFilename: emptyToUndefined(formData.get("originalFilename")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid application data",
    };
  }
  const {
    jobId,
    resumeURL,
    resumeId,
    coverNote,
    saveResume,
    resumeLabel,
    originalFilename,
  } = parsed.data;
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

    let resolvedUrl = resumeURL;
    if (resumeId) {
      const saved = await getSeekerResume(session.user.id, resumeId);
      if (!saved) {
        return {
          ok: false,
          error: "That saved resume is no longer available",
        };
      }
      resolvedUrl = saved.url;
    }

    if (!resolvedUrl) {
      return {
        ok: false,
        error: "Please choose or upload a resume",
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
      resumeURL: resolvedUrl,
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

    if (!resumeId && saveResume === "true") {
      const label =
        resumeLabel?.trim() ||
        labelFromFilename(originalFilename || "Resume.pdf");
      const saved = await createSeekerResume(session.user.id, {
        url: resolvedUrl,
        label,
        originalFilename: originalFilename || "",
        isDefault: false,
      });
      if (saved.resume) {
        revalidatePath("/account");
      }
    }

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
