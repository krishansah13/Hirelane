"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
  getResumeLabelError,
  isDuplicateResumeLabel,
  labelFromFilename,
  type SavedResume,
} from "@/lib/utils/resume";
import ResumeAddForm from "./ResumeAddForm";
import ResumeList from "./ResumeList";

const initialState: ResumeActionState = { ok: false };

export default function ResumeManager({
  resumes,
}: {
  resumes: SavedResume[];
}) {
  const router = useRouter();

  const [saveState, saveAction] = useActionState(saveResume, initialState);
  const [renameState, renameAction] = useActionState(updateResume, initialState);
  const [defaultState, defaultAction, defaultPending] = useActionState(
    setDefaultResume,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(deleteResume, initialState);

  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(resumes.length === 0);
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [renameError, setRenameError] = useState("");
  const [handledSaveId, setHandledSaveId] = useState<string | null>(null);
  const [handledDefaultId, setHandledDefaultId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SavedResume | null>(null);
  const [showAddForm, setShowAddForm] = useState(resumes.length === 0);

  const atLimit = resumes.length >= MAX_SAVED_RESUMES;
  const saveId = saveState.ok ? (saveState.resume?.id ?? "saved") : null;

  if (saveId && handledSaveId !== saveId) {
    setHandledSaveId(saveId);
    setFile(null);
    setLabel("");
    setSetAsDefault(false);
    setClientError("");
    setFileInputKey((key) => key + 1);
    setShowAddForm(false);
  }

  if (
    defaultState.ok &&
    defaultState.resume &&
    handledDefaultId !== defaultState.resume.id
  ) {
    setHandledDefaultId(defaultState.resume.id);
  }

  if (
    deleteState.ok &&
    deleteTarget &&
    deleteState.deletedId === deleteTarget.id
  ) {
    setDeleteTarget(null);
  }

  const saved = Boolean(
    saveId && handledSaveId === saveId && !file && !showAddForm,
  );
  const defaultUpdated = Boolean(
    defaultState.ok &&
      defaultState.resume &&
      handledDefaultId === defaultState.resume.id,
  );

  useEffect(() => {
    if (saveState.ok) router.refresh();
  }, [saveState.ok, saveState.resume?.id, router]);

  useEffect(() => {
    if (renameState.ok && renameState.resume) {
      setEditingId(null);
      setRenameError("");
      router.refresh();
      return;
    }

    if (!renameState.ok && renameState.error) {
      setRenameError(renameState.error);
    }
  }, [
    renameState.ok,
    renameState.error,
    renameState.resume?.id,
    renameState.resume?.label,
    router,
  ]);

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
    const nameError = getResumeLabelError(name);
    if (nameError) {
      setClientError(nameError);
      return;
    }
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

  function resetAddForm() {
    setFile(null);
    setLabel("");
    setSetAsDefault(resumes.length === 0);
    setClientError("");
    setFileInputKey((key) => key + 1);
  }

  function closeAddForm() {
    resetAddForm();
    setShowAddForm(false);
  }

  function clearSelectedFile() {
    if (file && label.trim() === labelFromFilename(file.name)) {
      setLabel("");
    }
    setFile(null);
    setFileInputKey((key) => key + 1);
    setClientError("");
  }

  const error =
    clientError ||
    (saveState.ok ? "" : saveState.error) ||
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
          <div className="flex shrink-0 items-center gap-3">
            <p className="text-xs font-medium tracking-wide text-gray-400">
              {resumes.length}/{MAX_SAVED_RESUMES}
            </p>
            {!showAddForm ? (
              <button
                type="button"
                disabled={atLimit}
                aria-expanded="false"
                aria-controls="add-resume-form"
                onClick={() => {
                  setShowAddForm(true);
                  setClientError("");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1739ad] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#12329c] disabled:opacity-70"
              >
                <Plus size={16} />
                Add resume
              </button>
            ) : null}
          </div>
        </div>

        {showAddForm ? (
          <ResumeAddForm
            resumes={resumes}
            atLimit={atLimit}
            uploading={uploading}
            file={file}
            label={label}
            setAsDefault={setAsDefault}
            fileInputKey={fileInputKey}
            onLabelChange={(value) => {
              setLabel(value);
              setClientError("");
            }}
            onFileChange={(next) => {
              setFile(next);
              setClientError("");
              if (next && !label.trim()) {
                setLabel(labelFromFilename(next.name));
              }
            }}
            onClearFile={clearSelectedFile}
            onCancel={closeAddForm}
            onSetAsDefaultChange={setSetAsDefault}
            onSubmit={handleUpload}
          />
        ) : null}

        {error || saved || defaultUpdated ? (
          <div className="space-y-3 px-5 pt-4 sm:px-6">
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

            {defaultUpdated && defaultState.resume ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 mb-5">
                “{defaultState.resume.label}” will be used when applying.
              </p>
            ) : null}
          </div>
        ) : null}

        <ResumeList
          resumes={resumes}
          showAddForm={showAddForm}
          editingId={editingId}
          editLabel={editLabel}
          setEditLabel={setEditLabel}
          setEditingId={setEditingId}
          setDeleteTarget={setDeleteTarget}
          renameError={renameError}
          setRenameError={setRenameError}
          renameAction={renameAction}
          defaultAction={defaultAction}
          defaultPending={defaultPending}
        />
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
