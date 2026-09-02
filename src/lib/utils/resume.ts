export function normalizeResumeLabel(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function labelFromFilename(filename: string) {
  const base = filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
  return normalizeResumeLabel(base).slice(0, 80) || "Resume";
}

export function resumeLabelsMatch(a: string, b: string) {
  return (
    normalizeResumeLabel(a).toLocaleLowerCase("en-IN") ===
    normalizeResumeLabel(b).toLocaleLowerCase("en-IN")
  );
}

export function getResumeLabelError(label: string): string | undefined {
  const name = normalizeResumeLabel(label);
  if (!name) return "Give this resume a name";
  if (name.length > 80) return "Name must be 80 characters or fewer";
  if (!/[\p{L}\p{N}]/u.test(name)) {
    return "Name must include a letter or number";
  }
  return undefined;
}

export function duplicateResumeNameMessage(label: string) {
  const name = normalizeResumeLabel(label);
  return `You already have a resume named “${name}”. Choose a different name.`;
}

export function isDuplicateResumeLabel(
  resumes: { id: string; label: string }[],
  label: string,
  exceptId?: string,
) {
  return resumes.some(
    (resume) =>
      resume.id !== exceptId && resumeLabelsMatch(resume.label, label),
  );
}

export const MAX_SAVED_RESUMES = 5;

export type SavedResume = {
  id: string;
  label: string;
  url: string;
  originalFilename: string;
  isDefault: boolean;
  createdAt: string;
};
