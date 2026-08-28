"use client";

import { createJob, JobActionState, updateJob } from "@/lib/actions/jobs";
import { JOB_FIELD_STEP, jobStepSchemas } from "@/lib/validation";
import { parseSkillList } from "@/lib/utils/skills";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import JobNavigationGuard from "./JobNavigationGuard";

type JobWriteFormProps = {
  mode: "create" | "edit";
  jobId?: string;
  initial?: {
    title: string;
    description: string;
    skills?: string;
    requirements?: string;
    location: string;
    type: string;
    isRemote: boolean;
    salaryMin: number;
    salaryMax: number;
    joiningDate?: string | null;
    expiresAt: string;
    status?: string;
  };
};

const STEPS = ["Role", "Location", "Compensation", "Review"];

const initialState: JobActionState = {
  ok: false,
};

type FieldErrors = Record<string, string>;

type ServerFieldError = {
  field: string;
  step: number;
  message: string;
};

function SubmitButton({
  label,
  name,
  value,
  disabled,
}: {
  label: string;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      className="rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="mt-1 block text-xs font-normal text-rose-600">
      {message}
    </span>
  );
}

function parseServerFieldError(message?: string) {
  if (!message) return null;

  const [field, ...rest] = message.split(": ");
  const step = JOB_FIELD_STEP[field];
  if (step === undefined || rest.length === 0) return null;

  return { field, step, message: rest.join(": ") };
}

function inputClass(hasError?: boolean) {
  return `mt-1 w-full rounded-xl border px-3 py-2 ${
    hasError ? "border-rose-400 bg-rose-50" : "border-gray-200"
  }`;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function normalizeJobValue(value: string | boolean | number) {
  return String(value ?? "").trim();
}

export default function JobWriteForm({
  mode,
  jobId,
  initial,
}: JobWriteFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createJob : updateJob;
  const [state, formAction] = useActionState(action, initialState);
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [skills, setSkills] = useState(initial?.skills || "");
  const [requirements, setRequirements] = useState(initial?.requirements || "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [type, setType] = useState(initial?.type ?? "full-time");
  const [isRemote, setIsRemote] = useState(initial?.isRemote ? "true" : "false");
  const [salaryMin, setSalaryMin] = useState(String(initial?.salaryMin ?? ""));
  const [salaryMax, setSalaryMax] = useState(String(initial?.salaryMax ?? ""));
  const [joiningDate, setJoiningDate] = useState(
    toDateInput(initial?.joiningDate),
  );
  const [expiresAt, setExpiresAt] = useState(toDateInput(initial?.expiresAt));
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<ServerFieldError | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const navigationSaveRef = useRef<{
    href: string;
    resolve: (ok: boolean) => void;
  } | null>(null);

  function clearFieldError(field: string) {
    setClientErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

    if (serverError?.field === field) {
      setServerError(null);
    }

    setGeneralError(null);
  }

  function updateField(
    field: string,
    setter: (value: string) => void,
  ) {
    return (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setter(event.target.value);
      clearFieldError(field);
    };
  }

  useEffect(() => {
    if (state.ok) {
      const pending = navigationSaveRef.current;
      navigationSaveRef.current = null;
      pending?.resolve(true);
      router.push(pending?.href ?? "/employer");
      return;
    }

    if (!state.error) return;

    navigationSaveRef.current?.resolve(false);
    navigationSaveRef.current = null;

    const parsedError = parseServerFieldError(state.error);

    if (parsedError) {
      setServerError(parsedError);
      setGeneralError(null);
      setStep(parsedError.step);
      return;
    }

    setServerError(null);
    setGeneralError(state.error);
  }, [state, router]);

  const values: Record<string, string> = {
    title,
    description,
    skills,
    requirements,
    location,
    type,
    isRemote,
    salaryMin,
    salaryMax,
    joiningDate,
    expiresAt,
  };
  const skillPreview = parseSkillList(skills);

  const hasChanges =
    normalizeJobValue(title) !== normalizeJobValue(initial?.title ?? "") ||
    normalizeJobValue(description) !==
      normalizeJobValue(initial?.description ?? "") ||
    normalizeJobValue(skills) !==
      normalizeJobValue(initial?.skills ?? "") ||
    normalizeJobValue(requirements) !==
      normalizeJobValue(initial?.requirements ?? "") ||
    normalizeJobValue(location) !==
      normalizeJobValue(initial?.location ?? "") ||
    normalizeJobValue(type) !==
      normalizeJobValue(initial?.type ?? "full-time") ||
    normalizeJobValue(isRemote) !==
      normalizeJobValue(initial?.isRemote ? "true" : "false") ||
    normalizeJobValue(salaryMin) !==
      normalizeJobValue(initial?.salaryMin ?? "") ||
    normalizeJobValue(salaryMax) !==
      normalizeJobValue(initial?.salaryMax ?? "") ||
    normalizeJobValue(joiningDate) !==
      normalizeJobValue(toDateInput(initial?.joiningDate)) ||
    normalizeJobValue(expiresAt) !==
      normalizeJobValue(toDateInput(initial?.expiresAt));

  const validateStep = useCallback(
    (index: number) => {
      const schema = jobStepSchemas[index];
      if (!schema) return {};

      const result = schema.safeParse(values);
      if (result.success) return {};

      const stepErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field && !stepErrors[field]) stepErrors[field] = issue.message;
      }
      return stepErrors;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      title,
      description,
      skills,
      requirements,
      location,
      type,
      isRemote,
      salaryMin,
      salaryMax,
      joiningDate,
      expiresAt,
    ],
  );

  function goToStep(next: number) {
    setClientErrors({});
    setGeneralError(null);
    setStep(next);
  }

  function handleContinue() {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setClientErrors(stepErrors);
      return;
    }
    goToStep(step + 1);
  }

  function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    for (let i = 0; i < jobStepSchemas.length; i += 1) {
      const stepErrors = validateStep(i);
      if (Object.keys(stepErrors).length > 0) {
        event.preventDefault();
        setClientErrors(stepErrors);
        setStep(i);
        return;
      }
    }
    setClientErrors({});
  }

  function firstInvalidStep() {
    for (let i = 0; i < jobStepSchemas.length; i += 1) {
      const stepErrors = validateStep(i);
      if (Object.keys(stepErrors).length > 0) {
        setClientErrors(stepErrors);
        setStep(i);
        return i;
      }
    }
    return -1;
  }

  function buildFormData(publish: "true" | "false") {
    const formData = new FormData();
    if (jobId) formData.append("jobId", jobId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("skills", skills);
    formData.append("requirements", requirements);
    formData.append("location", location);
    formData.append("type", type);
    formData.append("isRemote", isRemote);
    formData.append("salaryMin", salaryMin);
    formData.append("salaryMax", salaryMax);
    formData.append("joiningDate", joiningDate);
    formData.append("expiresAt", expiresAt);
    formData.append("publish", publish);
    return formData;
  }

  function saveDraftForNavigation(href: string) {
    if (firstInvalidStep() !== -1) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      navigationSaveRef.current = { href, resolve };
      formAction(buildFormData("false"));
    });
  }

  const errors: FieldErrors = {
    ...clientErrors,
    ...(serverError ? { [serverError.field]: serverError.message } : {}),
  };

  const stepHasErrors = Object.keys(errors).some(
    (field) => JOB_FIELD_STEP[field] === step,
  );

  return (
    <>
      <JobNavigationGuard
        hasChanges={hasChanges}
        onSaveDraft={saveDraftForNavigation}
      />

      <div className="space-y-6">
        <ol className="flex gap-2 text-xs font-medium text-gray-500">
          {STEPS.map((label, i) => {
            const invalid = i === step && stepHasErrors;
            return (
              <li
                key={label}
                className={`rounded-full px-3 py-1 ${
                  invalid
                    ? "bg-rose-50 text-rose-700"
                    : i === step
                      ? "bg-[#eef0ff] text-[#2e46ba]"
                      : "bg-gray-100"
                }`}
              >
                {i + 1}. {label}
              </li>
            );
          })}
        </ol>

        {serverError && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>
              Step {serverError.step + 1}. {STEPS[serverError.step]} —{" "}
              {serverError.message}
            </span>
            {serverError.step !== step && (
              <button
                type="button"
                onClick={() => setStep(serverError.step)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700"
              >
                Go to step {serverError.step + 1}
              </button>
            )}
          </div>
        )}

        {!serverError && generalError && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {generalError}
          </div>
        )}

        {!serverError && !generalError && stepHasErrors && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Fix the highlighted field
            {Object.keys(clientErrors).length > 1 ? "s" : ""}.
          </div>
        )}

        <form
          action={formAction}
          onSubmit={handleReviewSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >
          {jobId ? <input type="hidden" name="jobId" value={jobId} /> : null}

          {step === 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Title
                <input
                  name="title"
                  value={title}
                  onChange={updateField("title", setTitle)}
                  required
                  aria-invalid={Boolean(errors.title)}
                  className={inputClass(Boolean(errors.title))}
                  placeholder="e.g. Software Engineer"
                />
                <FieldError message={errors.title} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  name="description"
                  value={description}
                  placeholder="e.g. We are looking for a Software Engineer with 3 years of experience in React and Node.js."
                  onChange={updateField("description", setDescription)}
                  rows={8}
                  required
                  minLength={20}
                  aria-invalid={Boolean(errors.description)}
                  className={inputClass(Boolean(errors.description))}
                />
                <span className="mt-1 block text-xs font-normal text-gray-400">
                  {description.trim().length} / 20 characters minimum
                </span>
                <FieldError message={errors.description} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Skills
                <input
                  name="skills"
                  value={skills}
                  onChange={updateField("skills", setSkills)}
                  required
                  placeholder="React, TypeScript, Communication"
                  aria-invalid={Boolean(errors.skills)}
                  className={inputClass(Boolean(errors.skills))}
                />
                <span className="mt-1 block text-xs font-normal text-gray-400">
                  Separate with commas. At least 1 skill, up to 15.
                </span>
                {skillPreview.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skillPreview.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#2e46ba]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <FieldError message={errors.skills} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Requirements
                <textarea
                  name="requirements"
                  value={requirements}
                  onChange={updateField("requirements", setRequirements)}
                  rows={6}
                  required
                  minLength={20}
                  placeholder="Must-haves such as years of experience, education, and certifications."
                  aria-invalid={Boolean(errors.requirements)}
                  className={inputClass(Boolean(errors.requirements))}
                />
                <span className="mt-1 block text-xs font-normal text-gray-400">
                  {requirements.trim().length} / 20 characters minimum
                </span>
                <FieldError message={errors.requirements} />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="skills" value={skills} />
              <input type="hidden" name="requirements" value={requirements} />
              <label className="block text-sm font-medium text-gray-700">
                Location
                <input
                  name="location"
                  value={location}
                  onChange={updateField("location", setLocation)}
                  required
                  aria-invalid={Boolean(errors.location)}
                  className={inputClass(Boolean(errors.location))}
                />
                <FieldError message={errors.location} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Type
                <select
                  name="type"
                  value={type}
                  onChange={updateField("type", setType)}
                  aria-invalid={Boolean(errors.type)}
                  className={inputClass(Boolean(errors.type))}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
                <FieldError message={errors.type} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Work mode
                <select
                  name="isRemote"
                  value={isRemote}
                  onChange={updateField("isRemote", setIsRemote)}
                  aria-invalid={Boolean(errors.isRemote)}
                  className={inputClass(Boolean(errors.isRemote))}
                >
                  <option value="false">On-site</option>
                  <option value="true">Remote</option>
                </select>
                <FieldError message={errors.isRemote} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="skills" value={skills} />
              <input type="hidden" name="requirements" value={requirements} />
              <input type="hidden" name="location" value={location} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="isRemote" value={isRemote} />

              <label className="block text-sm font-medium text-gray-700">
                Min salary (INR)
                <input
                  name="salaryMin"
                  type="number"
                  value={salaryMin}
                  onChange={updateField("salaryMin", setSalaryMin)}
                  required
                  aria-invalid={Boolean(errors.salaryMin)}
                  className={inputClass(Boolean(errors.salaryMin))}
                />
                <FieldError message={errors.salaryMin} />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Max salary (INR)
                <input
                  name="salaryMax"
                  type="number"
                  value={salaryMax}
                  onChange={updateField("salaryMax", setSalaryMax)}
                  required
                  aria-invalid={Boolean(errors.salaryMax)}
                  className={inputClass(Boolean(errors.salaryMax))}
                />
                <FieldError message={errors.salaryMax} />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Joining date (optional)
                <input
                  name="joiningDate"
                  type="date"
                  value={joiningDate}
                  onChange={updateField("joiningDate", setJoiningDate)}
                  className={inputClass(Boolean(errors.joiningDate))}
                />
                <FieldError message={errors.joiningDate} />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Expires on
                <input
                  name="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={updateField("expiresAt", setExpiresAt)}
                  required
                  aria-invalid={Boolean(errors.expiresAt)}
                  className={inputClass(Boolean(errors.expiresAt))}
                />
                <FieldError message={errors.expiresAt} />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm text-gray-700">
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="skills" value={skills} />
              <input type="hidden" name="requirements" value={requirements} />
              <input type="hidden" name="location" value={location} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="isRemote" value={isRemote} />
              <input type="hidden" name="salaryMin" value={salaryMin} />
              <input type="hidden" name="salaryMax" value={salaryMax} />
              <input type="hidden" name="joiningDate" value={joiningDate} />
              <input type="hidden" name="expiresAt" value={expiresAt} />
              <p>
                <strong>Title:</strong> {title}
              </p>
              <p className="whitespace-pre-line">
                <strong>Description:</strong> {description || "—"}
                <span className="ml-2 text-xs text-gray-400">
                  ({description.trim().length} / 20 min)
                </span>
              </p>
              <div>
                <p>
                  <strong>Skills:</strong>
                </p>
                {skillPreview.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skillPreview.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#2e46ba]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">—</p>
                )}
              </div>
              <p className="whitespace-pre-line">
                <strong>Requirements:</strong> {requirements || "—"}
              </p>
              <p>
                <strong>Location:</strong> {location} ·{" "}
                {isRemote === "true" ? "Remote" : "On-site"}
              </p>
              <p>
                <strong>Type:</strong> {type}
              </p>
              <p>
                <strong>Salary:</strong> {salaryMin} – {salaryMax}
              </p>
              <p>
                <strong>Joining date:</strong> {joiningDate || "Not specified"}
              </p>
              <p>
                <strong>Expires:</strong> {expiresAt}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-[#eef0ff] px-5 py-2.5 text-sm font-semibold text-[#2e46ba]"
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <>
                {mode === "edit" && !hasChanges && (
                  <p className="w-full text-sm font-medium text-red-500">
                    No changes have been made.
                  </p>
                )}
                <SubmitButton
                  name="publish"
                  value="false"
                  disabled={mode === "edit" && !hasChanges}
                  label={mode === "create" ? "Save draft" : "Save changes"}
                />
                <SubmitButton
                  name="publish"
                  value="true"
                  disabled={initial?.status === "published"}
                  label={
                    initial?.status === "published"
                      ? "Already published"
                      : "Publish role"
                  }
                />
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
