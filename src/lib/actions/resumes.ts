"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isUserActive } from "@/lib/session";
import {
  resumeIdSchema,
  saveResumeSchema,
  updateResumeSchema,
} from "@/lib/validation";
import {
  createSeekerResume,
  deleteSeekerResume,
  listSeekerResumes,
  renameSeekerResume,
  setDefaultSeekerResume,
  type SavedResume,
} from "@/lib/resume-query";

export type ResumeActionState = {
  ok: boolean;
  error?: string;
  resume?: SavedResume;
  deletedId?: string;
};

function firstIssueMessage(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  return error.issues[0]?.message ?? "Invalid form data";
}

async function requireActiveSeeker() {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in" as const };
  }

  if (session.user.role !== "seeker") {
    return { error: "Only seekers can manage resumes" as const };
  }

  if (!(await isUserActive(session.user.id))) {
    return { error: "This account has been suspended" as const };
  }

  return { userId: session.user.id };
}

export async function getMyResumes(): Promise<SavedResume[]> {
  const session = await requireActiveSeeker();
  if ("error" in session) return [];
  return listSeekerResumes(session.userId);
}

export async function saveResume(
  _prev: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const session = await requireActiveSeeker();
  if ("error" in session) {
    return { ok: false, error: session.error };
  }

  const parsed = saveResumeSchema.safeParse({
    url: formData.get("url"),
    label: formData.get("label"),
    originalFilename: formData.get("originalFilename") || undefined,
    isDefault: formData.get("isDefault") === "true" ? "true" : "false",
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const result = await createSeekerResume(session.userId, {
    url: parsed.data.url,
    label: parsed.data.label,
    originalFilename: parsed.data.originalFilename,
    isDefault: parsed.data.isDefault === "true",
  });

  if (result.error || !result.resume) {
    return { ok: false, error: result.error ?? "Could not save resume" };
  }

  revalidatePath("/account");
  return { ok: true, resume: result.resume };
}

export async function updateResume(
  _prev: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const session = await requireActiveSeeker();
  if ("error" in session) {
    return { ok: false, error: session.error };
  }

  const parsed = updateResumeSchema.safeParse({
    resumeId: formData.get("resumeId"),
    label: formData.get("label"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const result = await renameSeekerResume(
    session.userId,
    parsed.data.resumeId,
    parsed.data.label,
  );

  if (result.error || !result.resume) {
    return { ok: false, error: result.error ?? "Could not rename resume" };
  }

  revalidatePath("/account");
  return { ok: true, resume: result.resume };
}

export async function setDefaultResume(
  _prev: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const session = await requireActiveSeeker();
  if ("error" in session) {
    return { ok: false, error: session.error };
  }

  const parsed = resumeIdSchema.safeParse({
    resumeId: formData.get("resumeId"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const result = await setDefaultSeekerResume(
    session.userId,
    parsed.data.resumeId,
  );

  if (result.error || !result.resume) {
    return { ok: false, error: result.error ?? "Could not update default resume" };
  }

  revalidatePath("/account");
  return { ok: true, resume: result.resume };
}

export async function deleteResume(
  _prev: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const session = await requireActiveSeeker();
  if ("error" in session) {
    return { ok: false, error: session.error };
  }

  const parsed = resumeIdSchema.safeParse({
    resumeId: formData.get("resumeId"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const result = await deleteSeekerResume(session.userId, parsed.data.resumeId);
  if (result.error) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/account");
  return { ok: true, deletedId: parsed.data.resumeId };
}
