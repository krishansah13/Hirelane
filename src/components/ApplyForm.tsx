"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  applyToJob,
  getMyJobApplicationStatus,
  type ApplyState,
} from "@/lib/actions/apply";

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
  const { data: session, status } = useSession();
  const [state, formAction] = useActionState(applyToJob, initialState);

  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [application, setApplication] = useState(existingApplication);
  const [loadingApplication, setLoadingApplication] = useState(
    !existingApplication,
  );

  useEffect(() => {
    if (state.ok) setSucceeded(true);
    if (state.error) setUploading(false);
  }, [state.ok, state.error]);

  useEffect(() => {
    if (existingApplication) {
      setApplication(existingApplication);
      setLoadingApplication(false);
      return;
    }

    if (status !== "authenticated" || session?.user?.role !== "seeker") {
      setLoadingApplication(false);
      return;
    }

    let cancelled = false;
    setLoadingApplication(true);

    getMyJobApplicationStatus(jobId).then((result) => {
      if (!cancelled) {
        setApplication(result);
        setLoadingApplication(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [jobId, existingApplication, status, session?.user?.role]);

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
        window.location.href = loginHref;
        return;
      }

      if (!uploadRes.ok || !uploadJson.url) {
        setClientError(uploadJson.error ?? "Resume upload failed");
        setUploading(false);
        return;
      }

      const actionData = new FormData();
      actionData.set("jobId", jobId);
      actionData.set("resumeURL", uploadJson.url);
      if (coverNote.trim()) {
        actionData.set("coverNote", coverNote.trim());
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
        <label
          htmlFor={`resume-${jobId}`}
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Resume (PDF)
        </label>
        <input
          id={`resume-${jobId}`}
          type="file"
          accept="application/pdf,.pdf"
          disabled={uploading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setClientError("");
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e9ff] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8] disabled:cursor-not-allowed disabled:opacity-70"
        />
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
        label={uploading ? "Uploading..." : "Apply for this job"}
        disabled={uploading}
      />
    </form>
  );
}