"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  applyToJob,
  getMyJobApplicationStatus,
  type ApplyState,
} from "@/lib/actions/apply";
import { getMyResumes } from "@/lib/actions/resumes";
import { MAX_SAVED_RESUMES, isDuplicateResumeLabel, labelFromFilename, type SavedResume } from "@/lib/utils/resume";

type ExistingApplication = {
  id: string;
  stage: string;
};

type ApplyFormProps = {
  jobId: string;
  slug: string;
  compact?: boolean;
  existingApplication?: ExistingApplication | null;
};

const initialState: ApplyState = { ok: false };
const UPLOAD_VALUE = "upload";

function SubmitButton({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="rounded-xl bg-[#2e46ba] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : label}
    </button>
  );
}

function ApplicationStatusNotice({
  application,
}: {
  application: ExistingApplication;
}) {
  const rejected = application.stage === "rejected";

  return (
    <div
      className={`rounded-xl px-4 py-3 ${rejected ? "bg-rose-50" : "bg-[#eef0ff]"
        }`}
    >
      <p
        className={`text-sm font-semibold ${rejected ? "text-rose-700" : "text-[#2e46ba]"
          }`}
      >
        {rejected ? "Rejected" : "Already applied"}
      </p>
      <p
        className={`mt-0.5 text-xs leading-5 ${rejected ? "text-rose-700/70" : "text-[#2e46ba]/70"
          }`}
      >
        {rejected
          ? "This company has closed your application."
          : "Track this role from your dashboard."}
      </p>
      <Link prefetch={false}
        href={`/dashboard/applications/${application.id}`}
        className={`mt-2 inline-flex text-xs font-medium hover:underline ${rejected ? "text-rose-700" : "text-[#2e46ba]"
          }`}
      >
        View application
      </Link>
    </div>
  );
}

export default function ApplyForm({
  jobId,
  slug,
  compact = false,
  existingApplication = null,
}: ApplyFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, formAction] = useActionState(applyToJob, initialState);

  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fetchedApplication, setFetchedApplication] = useState<
    ExistingApplication | null | undefined
  >(undefined);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [resumesLoaded, setResumesLoaded] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(UPLOAD_VALUE);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [resumeLabel, setResumeLabel] = useState("");

  const isSeeker = status === "authenticated" && session?.user?.role === "seeker";
  const usingUpload = selectedResumeId === UPLOAD_VALUE;
  const canSaveNew = resumes.length < MAX_SAVED_RESUMES;
  const succeeded = state.ok;
  const application = existingApplication ?? fetchedApplication ?? null;
  const loadingApplication =
    !existingApplication && isSeeker && fetchedApplication === undefined;
  const loadingResumes = isSeeker && !resumesLoaded;

  if (state.error && uploading) {
    setUploading(false);
  }

  useEffect(() => {
    if (existingApplication || !isSeeker) return;

    let cancelled = false;
    getMyJobApplicationStatus(jobId)
      .then((result) => {
        if (!cancelled) setFetchedApplication(result);
      })
      .catch(() => {
        if (!cancelled) setFetchedApplication(null);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, existingApplication, isSeeker]);

  useEffect(() => {
    if (!isSeeker) return;

    let cancelled = false;
    getMyResumes()
      .then((saved) => {
        if (cancelled) return;
        setResumes(saved);
        const preferred =
          saved.find((resume) => resume.isDefault) ?? saved[0] ?? null;
        setSelectedResumeId(preferred?.id ?? UPLOAD_VALUE);
        setResumesLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setResumesLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isSeeker]);

  const callbackUrl = `/jobs/${slug}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (status === "loading") {
    return (
      <p className="text-sm text-gray-500">Checking your session...</p>
    );
  }

  if (!session?.user) {
    return (
      <div className={compact ? "" : "rounded-2xl bg-white p-6 shadow-sm"}>
        <p className="text-sm text-gray-600">
          Sign in as a seeker to apply for this role.
        </p>
        <Link prefetch={false}
          href={loginHref}
          className="mt-4 inline-flex rounded-xl bg-[#2e46ba] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in to apply
        </Link>
      </div>
    );
  }

  if (session.user.role !== "seeker") {
    return (
      <div className={compact ? "" : "rounded-2xl bg-white p-6 shadow-sm"}>
        <p className="text-sm text-gray-600">
          This is the public listing seekers see. You can review it here, but
          only seekers can apply.
        </p>
      </div>
    );
  }

  if (loadingApplication) {
    return (
      <p className="text-sm text-gray-500">Checking your application...</p>
    );
  }

  if (application) {
    return (
      <div className={compact ? "" : "rounded-2xl bg-white p-6 shadow-sm"}>
        <ApplicationStatusNotice application={application} />
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        Application submitted. You can track it from your dashboard later.
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");

    const actionData = new FormData();
    actionData.set("jobId", jobId);
    if (coverNote.trim()) {
      actionData.set("coverNote", coverNote.trim());
    }

    if (!usingUpload) {
      setUploading(true);
      actionData.set("resumeId", selectedResumeId);
      startTransition(() => {
        formAction(actionData);
      });
      return;
    }

    if (!file) {
      setClientError("Please choose a PDF resume");
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = (await uploadRes.json()) as {
        url?: string;
        error?: string;
      };

      if (uploadRes.status === 401) {
        router.push(loginHref);
        return;
      }

      if (!uploadRes.ok || !uploadJson.url) {
        setClientError(uploadJson.error ?? "Resume upload failed");
        setUploading(false);
        return;
      }

      actionData.set("resumeURL", uploadJson.url);
      actionData.set("originalFilename", file.name);
      const name = resumeLabel.trim() || labelFromFilename(file.name);
      if (
        saveToAccount &&
        canSaveNew &&
        !isDuplicateResumeLabel(resumes, name)
      ) {
        actionData.set("saveResume", "true");
        actionData.set("resumeLabel", name);
      }

      startTransition(() => {
        formAction(actionData);
      });
    } catch {
      setClientError("Something went wrong. Please try again.");
      setUploading(false);
    }
  }

  const error = clientError || state.error;

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "space-y-4"
          : "space-y-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      }
    >
      {!compact && (
        <h2 className="text-xl font-bold text-gray-950">Apply for this job</h2>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={`resume-source-${jobId}`}
            className="block text-sm font-medium text-gray-900"
          >
            Resume (PDF)
          </label>
          <Link
            prefetch={false}
            href="/account#resumes"
            className="text-xs font-medium text-[#2e46ba] hover:underline"
          >
            Manage resumes
          </Link>
        </div>

        {loadingResumes ? (
          <p className="text-sm text-gray-500">Loading saved resumes...</p>
        ) : (
          <>
            {resumes.length > 0 ? (
              <select
                id={`resume-source-${jobId}`}
                value={selectedResumeId}
                disabled={uploading}
                onChange={(event) => {
                  setSelectedResumeId(event.target.value);
                  setClientError("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2e46ba] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.label}
                    {resume.isDefault ? " (Default)" : ""}
                  </option>
                ))}
                <option value={UPLOAD_VALUE}>Upload a new PDF</option>
              </select>
            ) : null}

            {usingUpload ? (
              <div className={resumes.length > 0 ? "mt-3 space-y-3" : "space-y-3"}>
                <input
                  id={`resume-${jobId}`}
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={uploading}
                  onChange={(event) => {
                    const next = event.target.files?.[0] ?? null;
                    setFile(next);
                    setClientError("");
                    if (next && !resumeLabel.trim()) {
                      setResumeLabel(labelFromFilename(next.name));
                    }
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e9ff] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8] disabled:cursor-not-allowed disabled:opacity-70"
                />

                {canSaveNew ? (
                  <>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={saveToAccount}
                        disabled={uploading}
                        onChange={(event) => setSaveToAccount(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#2e46ba]"
                      />
                      Save this resume to my account
                    </label>
                    {saveToAccount ? (
                      <input
                        value={resumeLabel}
                        onChange={(event) => setResumeLabel(event.target.value)}
                        maxLength={80}
                        disabled={uploading}
                        placeholder="Name this resume"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2e46ba] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    You already have {MAX_SAVED_RESUMES} saved resumes. Remove
                    one from Account to save this file.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                This saved PDF will be attached to your application.
              </p>
            )}
          </>
        )}
      </div>

      <div>
        <label
          htmlFor={`cover-${jobId}`}
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Cover note <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id={`cover-${jobId}`}
          rows={compact ? 3 : 4}
          maxLength={2000}
          value={coverNote}
          disabled={uploading}
          onChange={(event) => setCoverNote(event.target.value)}
          placeholder="A short note for the hiring team"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2e46ba] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}

      <SubmitButton
        label={
          uploading
            ? usingUpload
              ? "Uploading..."
              : "Submitting..."
            : "Apply for this job"
        }
        disabled={uploading || loadingResumes}
      />
    </form>
  );
}
