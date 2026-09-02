"use client";

import type { SavedResume } from "@/lib/utils/resume";

export default function ResumeActions({
  resume,
  renaming,
  setEditingId,
  setEditLabel,
  setDeleteTarget,
  setRenameError,
}: {
  resume: SavedResume;
  renaming: boolean;
  setEditingId: (id: string | null) => void;
  setEditLabel: (value: string) => void;
  setDeleteTarget: (resume: SavedResume) => void;
  setRenameError: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <a
        href={resume.url}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg px-3 py-2 text-sm font-medium text-[#2e46ba] hover:bg-[#f5f6ff]"
      >
        View
      </a>
      {!renaming ? (
        <button
          type="button"
          onClick={() => {
            setEditingId(resume.id);
            setEditLabel(resume.label);
            setRenameError("");
          }}
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Rename
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setDeleteTarget(resume)}
        className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
      >
        Remove
      </button>
    </div>
  );
}
