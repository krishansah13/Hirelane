import Resume from "./models/Resume";
import Application from "./models/Application";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { MAX_SAVED_RESUMES, type SavedResume, duplicateResumeNameMessage, isDuplicateResumeLabel, normalizeResumeLabel } from "./utils/resume";

export type { SavedResume } from "./utils/resume";

type ResumeRecord = {
  _id: unknown;
  label?: string;
  url?: string;
  originalFilename?: string;
  isDefault?: boolean;
  createdAt?: string | Date;
};

function toSavedResume(record: ResumeRecord): SavedResume {
  const serialized = serialize(record);
  const createdAt =
    serialized.createdAt instanceof Date
      ? serialized.createdAt.toISOString()
      : String(serialized.createdAt ?? "");

  return {
    id: String(serialized._id),
    label: serialized.label ?? "Resume",
    url: serialized.url ?? "",
    originalFilename: serialized.originalFilename ?? "",
    isDefault: Boolean(serialized.isDefault),
    createdAt,
  };
}

export async function listSeekerResumes(userId: string): Promise<SavedResume[]> {
  await connectToDatabase();
  const rows = await Resume.find({ userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  return rows.map((row) => toSavedResume(row as ResumeRecord));
}

export async function getSeekerResume(userId: string, resumeId: string) {
  await connectToDatabase();
  const row = await Resume.findOne({ _id: resumeId, userId }).lean();
  return row ? toSavedResume(row as ResumeRecord) : null;
}

export async function createSeekerResume(
  userId: string,
  data: {
    url: string;
    label: string;
    originalFilename?: string;
    isDefault?: boolean;
  },
): Promise<{ resume?: SavedResume; error?: string }> {
  await connectToDatabase();

  const existing = await Resume.findOne({ userId, url: data.url }).lean();
  if (existing) {
    return { resume: toSavedResume(existing as ResumeRecord) };
  }

  const label = normalizeResumeLabel(data.label);
  const named = await Resume.find({ userId }).select("_id label").lean();
  if (
    isDuplicateResumeLabel(
      named.map((row) => ({
        id: String(row._id),
        label: String(row.label ?? ""),
      })),
      label,
    )
  ) {
    return { error: duplicateResumeNameMessage(label) };
  }

  const count = await Resume.countDocuments({ userId });
  if (count >= MAX_SAVED_RESUMES) {
    return {
      error: `You can save up to ${MAX_SAVED_RESUMES} resumes. Remove one first.`,
    };
  }

  const makeDefault = Boolean(data.isDefault) || count === 0;
  if (makeDefault) {
    await Resume.updateMany({ userId }, { $set: { isDefault: false } });
  }

  const created = await Resume.create({
    userId,
    label,
    url: data.url,
    originalFilename: data.originalFilename ?? "",
    isDefault: makeDefault,
  });

  return { resume: toSavedResume(created.toObject() as ResumeRecord) };
}

export async function renameSeekerResume(
  userId: string,
  resumeId: string,
  label: string,
): Promise<{ resume?: SavedResume; error?: string }> {
  await connectToDatabase();

  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    return { error: "Resume not found" };
  }

  const nextLabel = normalizeResumeLabel(label);
  const named = await Resume.find({ userId }).select("_id label").lean();
  if (
    isDuplicateResumeLabel(
      named.map((row) => ({
        id: String(row._id),
        label: String(row.label ?? ""),
      })),
      nextLabel,
      resumeId,
    )
  ) {
    return { error: duplicateResumeNameMessage(nextLabel) };
  }

  resume.label = nextLabel;
  await resume.save();

  return { resume: toSavedResume(resume.toObject() as ResumeRecord) };
}

export async function setDefaultSeekerResume(
  userId: string,
  resumeId: string,
): Promise<{ resume?: SavedResume; error?: string }> {
  await connectToDatabase();

  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    return { error: "Resume not found" };
  }

  await Resume.updateMany({ userId }, { $set: { isDefault: false } });
  resume.isDefault = true;
  await resume.save();

  return { resume: toSavedResume(resume.toObject() as ResumeRecord) };
}

export async function deleteSeekerResume(
  userId: string,
  resumeId: string,
): Promise<{ error?: string }> {
  await connectToDatabase();

  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    return { error: "Resume not found" };
  }

  const url = String(resume.url ?? "");
  const wasDefault = Boolean(resume.isDefault);

  await resume.deleteOne();

  if (wasDefault) {
    const next = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  if (url) {
    const stillUsed = await Application.exists({ resumeURL: url });
    const stillSaved = await Resume.exists({ url });
    if (!stillUsed && !stillSaved) {
      try {
        const { destroyResumePdf } = await import("./upload");
        await destroyResumePdf(url);
      } catch (error) {
        console.error("Cloudinary resume delete failed", error);
      }
    }
  }

  return {};
}
