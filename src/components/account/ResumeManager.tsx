"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { FileText, Star } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  deleteResume,
  saveResume,
  setDefaultResume,
  updateResume,
  type ResumeActionState,
} from "@/lib/actions/resumes";
import {
  MAX_SAVED_RESUMES,
  duplicateResumeNameMessage,
  isDuplicateResumeLabel,
  labelFromFilename,
  type SavedResume,
} from "@/lib/utils/resume";

const initialState: ResumeActionState = { ok: false };

const FIELD_CLASS =
  "mt-1.5 h-11 w-full rounded-xl bg-white px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA] disabled:bg-gray-50";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

export default function ResumeManager({
  resumes,
}: {
  resumes: SavedResume[];
}) {
  const router = useRouter();

  const [saveState, saveAction] = useActionState(saveResume, initialState);
  const [renameState, renameAction] = useActionState(updateResume, initialState);
  const [defaultState, defaultAction] = useActionState(
    setDefaultResume,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(deleteResume, initialState);

  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(resumes.length === 0);
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [handledSaveId, setHandledSaveId] = useState<string | null>(null);
  const [handledRenameId, setHandledRenameId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SavedResume | null>(null);

  const atLimit = resumes.length >= MAX_SAVED_RESUMES;
  const saveId = saveState.ok ? (saveState.resume?.id ?? "saved") : null;

  if (saveId && handledSaveId !== saveId) {
    setHandledSaveId(saveId);
    setFile(null);
    setLabel("");
    setSetAsDefault(false);
    setClientError("");
    setFileInputKey((key) => key + 1);
  }

  if (
    renameState.ok &&
    renameState.resume &&
    handledRenameId !== renameState.resume.id
  ) {
    setHandledRenameId(renameState.resume.id);
    setEditingId(null);
  }

  if (
    deleteState.ok &&
    deleteTarget &&
    deleteState.deletedId === deleteTarget.id
  ) {
    setDeleteTarget(null);
  }

  const saved = Boolean(saveId && handledSaveId === saveId && !file);

  useEffect(() => {
    if (saveState.ok) router.refresh();
  }, [saveState.ok, saveState.resume?.id, router]);

  useEffect(() => {
    if (renameState.ok) router.refresh();
  }, [renameState.ok, renameState.resume?.id, router]);

  useEffect(() => {
    if (defaultState.ok) router.refresh();
  }, [defaultState.ok, defaultState.resume?.id, router]);

  useEffect(() => {
    if (deleteState.ok) router.refresh();
  }, [deleteState.ok, deleteState.deletedId, router]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");

    if (atLimit) {
      setClientError(
        `You can save up to ${MAX_SAVED_RESUMES} resumes. Remove one first.`,
      );
      return;
    }

    if (!file) {
      setClientError("Please choose a PDF resume");
      return;
    }

    const name = label.trim() || labelFromFilename(file.name);
    if (isDuplicateResumeLabel(resumes, name)) {
      setClientError(duplicateResumeNameMessage(name));
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
        router.push("/login?callbackUrl=/account%23resumes");
        return;
      }

      if (!uploadRes.ok || !uploadJson.url) {
        setClientError(uploadJson.error ?? "Resume upload failed");
        return;
      }

      const actionData = new FormData();
      actionData.set("url", uploadJson.url);
      actionData.set("label", name);
      actionData.set("originalFilename", file.name);
      if (setAsDefault || resumes.length === 0) {
        actionData.set("isDefault", "true");
      }

      startTransition(() => {
        saveAction(actionData);
      });
    } catch {
      setClientError("Could not upload your resume. Try again.");
    } finally {
      setUploading(false);
    }
  }

  const error =
    clientError ||
    (saveState.ok ? "" : saveState.error) ||
    (renameState.ok ? "" : renameState.error) ||
    (defaultState.ok ? "" : defaultState.error) ||
    (deleteState.ok ? "" : deleteState.error);

  return (
    <section id="resumes" className="scroll-mt-20">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Saved resumes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload uniquely named PDFs, then choose which one is used when
              applying.
            </p>
          </div>
          <p className="shrink-0 text-xs font-medium tracking-wide text-gray-400">
            {resumes.length}/{MAX_SAVED_RESUMES}
          </p>
        </div>

        <form
          onSubmit={handleUpload}
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
                onChange={(event) => {
                  setLabel(event.target.value);
                  setClientError("");
                }}
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
                  const next = event.target.files?.[0] ?? null;
                  setFile(next);
                  setClientError("");
                  if (next && !label.trim()) {
                    setLabel(labelFromFilename(next.name));
                  }
                }}
                className="mt-1.5 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#4338a8] disabled:opacity-70"
              />
            </label>

            <UploadButton
              label={uploading ? "Uploading..." : "Save resume"}
              disabled={atLimit || uploading}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={setAsDefault || resumes.length === 0}
              disabled={atLimit || uploading || resumes.length === 0}
              onChange={(event) => setSetAsDefault(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#2e46ba]"
            />
            Use this resume when applying
          </label>
          <p className="text-xs text-gray-400">
            Each resume needs its own name. PDF only, max 5MB.
          </p>

          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          ) : null}

          {saved ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Resume saved. You can reuse it on job applications.
            </p>
          ) : null}
        </form>

        {resumes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <FileText size={22} className="text-[#2e46ba]" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              No saved resumes yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a PDF above. You can then configure which one is used when
              applying.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 lg:hidden">
              {resumes.map((resume) => (
                <ResumeRow
                  key={resume.id}
                  resume={resume}
                  resumes={resumes}
                  renaming={editingId === resume.id}
                  editLabel={editLabel}
                  setEditLabel={setEditLabel}
                  setEditingId={setEditingId}
                  setDeleteTarget={setDeleteTarget}
                  setClientError={setClientError}
                  renameAction={renameAction}
                  defaultAction={defaultAction}
                />
              ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Resume</th>
                    <th className="px-6 py-3 font-medium">File</th>
                    <th className="px-6 py-3 font-medium">Saved</th>
                    <th className="px-6 py-3 font-medium">When applying</th>
                    <th className="px-6 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resumes.map((resume) => {
                    const renaming = editingId === resume.id;
                    return (
                      <tr key={resume.id} className="align-middle">
                        <td className="px-6 py-4">
                          {renaming ? (
                            <RenameForm
                              resume={resume}
                              resumes={resumes}
                              editLabel={editLabel}
                              setEditLabel={setEditLabel}
                              setEditingId={setEditingId}
                              setClientError={setClientError}
                              renameAction={renameAction}
                            />
                          ) : (
                            <p className="font-semibold text-gray-950">
                              {resume.label}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {resume.originalFilename || "PDF"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(resume.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <DefaultControl
                            resume={resume}
                            defaultAction={defaultAction}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ResumeActions
                            resume={resume}
                            renaming={renaming}
                            setEditingId={setEditingId}
                            setEditLabel={setEditLabel}
                            setDeleteTarget={setDeleteTarget}
                            setClientError={setClientError}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove resume"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.label}” from your account? Applications you already submitted keep their copy.`
            : "Remove this resume from your account?"
        }
        confirmLabel="Remove resume"
        pendingLabel="Removing…"
        formAction={deleteAction}
      >
        {deleteTarget ? (
          <input type="hidden" name="resumeId" value={deleteTarget.id} />
        ) : null}
      </ConfirmModal>
    </section>
  );
}

function DefaultControl({
  resume,
  defaultAction,
}: {
  resume: SavedResume;
  defaultAction: (formData: FormData) => void;
}) {
  if (resume.isDefault) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0ff] px-3 py-1 text-xs font-medium text-[#2e46ba]">
        <Star size={12} />
        Used when applying
      </span>
    );
  }

  return (
    <form action={defaultAction}>
      <input type="hidden" name="resumeId" value={resume.id} />
      <button
        type="submit"
        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#f5f6ff] hover:text-[#2E46BA]"
      >
        Use when applying
      </button>
    </form>
  );
}

function ResumeActions({
  resume,
  renaming,
  setEditingId,
  setEditLabel,
  setDeleteTarget,
  setClientError,
}: {
  resume: SavedResume;
  renaming: boolean;
  setEditingId: (id: string | null) => void;
  setEditLabel: (value: string) => void;
  setDeleteTarget: (resume: SavedResume) => void;
  setClientError: (value: string) => void;
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
            setClientError("");
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

function RenameForm({
  resume,
  resumes,
  editLabel,
  setEditLabel,
  setEditingId,
  setClientError,
  renameAction,
}: {
  resume: SavedResume;
  resumes: SavedResume[];
  editLabel: string;
  setEditLabel: (value: string) => void;
  setEditingId: (id: string | null) => void;
  setClientError: (value: string) => void;
  renameAction: (formData: FormData) => void;
}) {
  return (
    <form
      className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
      action={renameAction}
      onSubmit={(event) => {
        if (isDuplicateResumeLabel(resumes, editLabel, resume.id)) {
          event.preventDefault();
          setClientError(duplicateResumeNameMessage(editLabel));
        }
      }}
    >
      <input type="hidden" name="resumeId" value={resume.id} />
      <input
        name="label"
        value={editLabel}
        onChange={(event) => setEditLabel(event.target.value)}
        maxLength={80}
        required
        className="h-10 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA] sm:max-w-xs"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#2e46ba] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditingId(null)}
          className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ResumeRow({
  resume,
  resumes,
  renaming,
  editLabel,
  setEditLabel,
  setEditingId,
  setDeleteTarget,
  setClientError,
  renameAction,
  defaultAction,
}: {
  resume: SavedResume;
  resumes: SavedResume[];
  renaming: boolean;
  editLabel: string;
  setEditLabel: (value: string) => void;
  setEditingId: (id: string | null) => void;
  setDeleteTarget: (resume: SavedResume) => void;
  setClientError: (value: string) => void;
  renameAction: (formData: FormData) => void;
  defaultAction: (formData: FormData) => void;
}) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="min-w-0">
        {renaming ? (
          <RenameForm
            resume={resume}
            resumes={resumes}
            editLabel={editLabel}
            setEditLabel={setEditLabel}
            setEditingId={setEditingId}
            setClientError={setClientError}
            renameAction={renameAction}
          />
        ) : (
          <p className="font-semibold text-gray-950">{resume.label}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {resume.originalFilename ? `${resume.originalFilename} · ` : ""}
          Saved {formatDate(resume.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DefaultControl resume={resume} defaultAction={defaultAction} />
        <ResumeActions
          resume={resume}
          renaming={renaming}
          setEditingId={setEditingId}
          setEditLabel={setEditLabel}
          setDeleteTarget={setDeleteTarget}
          setClientError={setClientError}
        />
      </div>
    </li>
  );
}
