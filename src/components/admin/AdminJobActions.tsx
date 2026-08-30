"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  closeAdminJob,
  deleteAdminJob,
  type AdminJobActionState,
} from "@/lib/actions/admin-jobs";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialState: AdminJobActionState = { ok: false };

function CloseButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2e46ba] transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Closing…" : "Close job"}
    </button>
  );
}

export default function AdminJobActions({
  jobId,
  canClose,
  redirectToList = false,
}: {
  jobId: string;
  canClose: boolean;
  redirectToList?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [closeState, closeAction] = useActionState(closeAdminJob, initialState);
  const [deleteState, deleteAction] = useActionState(deleteAdminJob, initialState);
  const error = closeState.error || deleteState.error;

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {canClose ? (
          <form action={closeAction}>
            <input type="hidden" name="jobId" value={jobId} />
            <CloseButton />
          </form>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        >
          Remove
        </button>
      </div>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        title="Remove job"
        description="Remove this job and its applications? This cannot be undone."
        confirmLabel="Remove job"
        pendingLabel="Removing…"
        formAction={deleteAction}
      >
        <input type="hidden" name="jobId" value={jobId} />
        {redirectToList ? (
          <input type="hidden" name="redirectTo" value="list" />
        ) : null}
      </ConfirmModal>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
