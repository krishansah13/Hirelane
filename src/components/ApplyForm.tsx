"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ApplyToJob } from "@/lib/actions/apply";
import { useToast } from "@/components/ui/Toast";

type ApplyFormProps = {
  jobId: string;
  slug: string;
  compact?: boolean;
  onSuccess?: () => void;
  applyAction: ApplyToJob;
};

export default function ApplyForm({
  jobId,
  slug,
  compact = false,
  onSuccess,
  applyAction,
}: ApplyFormProps) {
  const { data: session, status } = useSession();
  const toast = useToast();

  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

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
    return (
      <p className="text-sm text-gray-600">
        Employer accounts cannot apply. Use a seeker account instead.
      </p>
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

    if (!file) {
      toast.error("Please choose a PDF resume");
      return;
    }

    setBusy(true);

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
        toast.error(uploadJson.error ?? "Resume upload failed");
        return;
      }

      const result = await applyAction({
        jobId,
        resumeURL: uploadJson.url,
        coverNote: coverNote.trim() || undefined,
      });

      if (!result.ok) {
        toast.error(result.error ?? "Could not submit application");
        return;
      }

      toast.success("Application submitted. Track it from your dashboard.");
      setSucceeded(true);
      onSuccess?.();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

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

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-[#2e46ba] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Submitting..." : "Apply for this job"}
      </button>
    </form>
  );
}
