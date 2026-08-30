"use client";

import { useActionState, useState } from "react";
import {
  deleteAdminEmployer,
  type AdminUserActionState,
} from "@/lib/actions/admin-users";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialState: AdminUserActionState = { ok: false };

export default function AdminRemoveEmployer({
  userId,
  companyId,
  name,
}: {
  userId: string;
  companyId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteAdminEmployer, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-rose-700 transition hover:text-rose-800"
      >
        Remove
      </button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        title="Remove employer"
        description={`Remove ${name}'s employer account? They will no longer be able to sign in. Jobs they posted stay with the company.`}
        confirmLabel="Remove account"
        pendingLabel="Removing…"
        formAction={formAction}
      >
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="companyId" value={companyId} />
      </ConfirmModal>

      {state.error ? (
        <p className="text-xs text-rose-600">{state.error}</p>
      ) : null}
    </div>
  );
}
