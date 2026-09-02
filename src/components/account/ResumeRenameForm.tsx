"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";
import {
  duplicateResumeNameMessage,
  getResumeLabelError,
  isDuplicateResumeLabel,
  normalizeResumeLabel,
  type SavedResume,
} from "@/lib/utils/resume";

function RenameFields({
  resume,
  editLabel,
  setEditLabel,
  setRenameError,
  renameError,
  onCancel,
}: {
  resume: SavedResume;
  editLabel: string;
  setEditLabel: (value: string) => void;
  setRenameError: (value: string) => void;
  renameError: string;
  onCancel: () => void;
}) {
  const { pending } = useFormStatus();
  const errorId = useId();

  return (
    <>
      <input type="hidden" name="resumeId" value={resume.id} />
      <div className="min-w-0 w-full sm:max-w-xs">
        <input
          name="label"
          value={editLabel}
          onChange={(event) => {
            setEditLabel(event.target.value);
            if (renameError) setRenameError("");
          }}
          maxLength={80}
          required
          disabled={pending}
          aria-busy={pending}
          aria-invalid={Boolean(renameError)}
          aria-describedby={renameError ? errorId : undefined}
          className={`h-10 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm outline-none ring-1 focus:ring-2 focus:ring-[#2E46BA] disabled:bg-gray-50 disabled:text-gray-500 ${
            renameError ? "ring-rose-400" : "ring-[#dcd8ea]"
          }`}
        />
        {renameError ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs font-medium text-rose-700"
          >
            {renameError}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#2e46ba] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

export default function ResumeRenameForm({
  resume,
  resumes,
  editLabel,
  setEditLabel,
  setEditingId,
  renameError,
  setRenameError,
  renameAction,
}: {
  resume: SavedResume;
  resumes: SavedResume[];
  editLabel: string;
  setEditLabel: (value: string) => void;
  setEditingId: (id: string | null) => void;
  renameError: string;
  setRenameError: (value: string) => void;
  renameAction: (formData: FormData) => void;
}) {
  return (
    <form
      className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start"
      action={renameAction}
      noValidate
      onSubmit={(event) => {
        const nameError = getResumeLabelError(editLabel);
        if (nameError) {
          event.preventDefault();
          setRenameError(nameError);
          return;
        }

        const name = normalizeResumeLabel(editLabel);
        if (name === normalizeResumeLabel(resume.label)) {
          event.preventDefault();
          setRenameError("");
          setEditingId(null);
          return;
        }

        if (isDuplicateResumeLabel(resumes, name, resume.id)) {
          event.preventDefault();
          setRenameError(duplicateResumeNameMessage(name));
        }
      }}
    >
      <RenameFields
        resume={resume}
        editLabel={editLabel}
        setEditLabel={setEditLabel}
        setRenameError={setRenameError}
        renameError={renameError}
        onCancel={() => {
          setRenameError("");
          setEditingId(null);
        }}
      />
    </form>
  );
}
