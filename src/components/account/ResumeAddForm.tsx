"use client";

import { useFormStatus } from "react-dom";
import { X } from "lucide-react";
import type { SavedResume } from "@/lib/utils/resume";

const FIELD_CLASS =
  "mt-1.5 h-11 w-full rounded-xl bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA] disabled:bg-gray-50";

function UploadButton({
  label,
  disabled,
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
      className="h-11 rounded-xl bg-[#1739ad] px-5 text-sm font-semibold text-white transition hover:bg-[#12329c] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function ResumeAddForm({
  resumes,
  atLimit,
  uploading,
  file,
  label,
  setAsDefault,
  fileInputKey,
  onLabelChange,
  onFileChange,
  onClearFile,
  onCancel,
  onSetAsDefaultChange,
  onSubmit,
}: {
  resumes: SavedResume[];
  atLimit: boolean;
  uploading: boolean;
  file: File | null;
  label: string;
  setAsDefault: boolean;
  fileInputKey: number;
  onLabelChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onClearFile: () => void;
  onCancel: () => void;
  onSetAsDefaultChange: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      id="add-resume-form"
      onSubmit={onSubmit}
      className="space-y-4 border-b border-gray-100 bg-[#fbf9ff] p-5 sm:p-6"
    >
      <p className="text-xs font-medium tracking-wide text-gray-500">
        Add a resume
      </p>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block text-xs font-medium text-gray-500">
          Resume name
          <input
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            maxLength={80}
            placeholder="Software engineer resume"
            disabled={atLimit || uploading}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block text-xs font-medium text-gray-500">
          PDF file
          <input
            key={fileInputKey}
            type="file"
            accept="application/pdf,.pdf"
            disabled={atLimit || uploading}
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
            }}
            className="mt-1.5 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8] disabled:opacity-70"
          />
          {file ? (
            <span className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-[#dcd8ea]">
              <span className="min-w-0 truncate">{file.name}</span>
              <button
                type="button"
                disabled={uploading}
                onClick={onClearFile}
                className="inline-flex shrink-0 items-center gap-1 font-medium text-gray-700 hover:text-rose-700 disabled:opacity-70"
              >
                <X size={14} />
                Clear file
              </button>
            </span>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2">
          <UploadButton
            label={uploading ? "Uploading..." : "Save resume"}
            disabled={atLimit || uploading}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={onCancel}
            className="h-11 rounded-xl px-5 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={setAsDefault || resumes.length === 0}
          disabled={atLimit || uploading || resumes.length === 0}
          onChange={(event) => onSetAsDefaultChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#2e46ba]"
        />
        Use this resume when applying
      </label>
      <p className="text-xs text-gray-400">
        Each resume needs its own name. PDF only, max 5MB.
      </p>
    </form>
  );
}
