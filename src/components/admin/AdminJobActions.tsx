"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  closeAdminJob,
  deleteAdminJob,
  type AdminJobActionState,
} from "@/lib/actions/admin-jobs";

const initialState: AdminJobActionState = { ok: false };

function ActionButton({
  label,
  pendingLabel,
  danger = false,
}: {
  label: string;
  pendingLabel: string;
  danger?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
        danger
          ? "text-rose-700 hover:bg-rose-50"
          : "bg-[#eef0ff] text-[#2e46ba] hover:bg-indigo-100"
      }`}
    >
      {pending ? pendingLabel : label}
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
  const [closeState, closeAction] = useActionState(closeAdminJob, initialState);
  const [deleteState, deleteAction] = useActionState(deleteAdminJob, initialState);
  const error = closeState.error || deleteState.error;

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {canClose ? (
          <form action={closeAction}>
            <input type="hidden" name="jobId" value={jobId} />
            <ActionButton label="Close job" pendingLabel="Closing…" />
          </form>
        ) : null}

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Remove this job and its applications? This cannot be undone.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="jobId" value={jobId} />
          {redirectToList ? (
            <input type="hidden" name="redirectTo" value="list" />
          ) : null}
          <ActionButton
            label="Remove"
            pendingLabel="Removing…"
            danger
          />
        </form>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
