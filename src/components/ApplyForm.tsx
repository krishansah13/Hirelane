"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { applyToJob, type ApplyState } from "@/lib/actions/apply";
import { getHomePath } from "@/lib/roles";

type ApplyFormProps = {
  jobId: string;
  slug: string;
  compact?: boolean;
};

const initialState: ApplyState = { ok: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#2e46ba] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Submitting..." : label}
    </button>
  );
}

export default function ApplyForm({
  jobId,
  slug,
  compact = false,
}: ApplyFormProps) {
  const { data: session, status } = useSession();
  const [state, formAction] = useActionState(applyToJob, initialState);

  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (state.ok) setSucceeded(true);
  }, [state.ok]);

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
        <Link
          href={loginHref}
          className="mt-4 inline-flex rounded-xl bg-[#2e46ba] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in to apply
        </Link>
      </div>
    );
  }

  if (session.user.role !== "seeker") {
    const homeHref = getHomePath(session.user.role);
    return (
      <div className={compact ? "" : "rounded-2xl bg-white p-6 shadow-sm"}>
        <p className="text-sm text-gray-600">
          This is the public listing seekers see. You can review it here, but
          only seekers can apply.
        </p>
      
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
    } finally {
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
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setClientError("");
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e9e9ff] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8]"
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
          onChange={(event) => setCoverNote(event.target.value)}
          placeholder="A short note for the hiring team"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#2e46ba] focus:bg-white"
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

      <SubmitButton label={uploading ? "Uploading..." : "Apply for this job"} />
    </form>
  );
}