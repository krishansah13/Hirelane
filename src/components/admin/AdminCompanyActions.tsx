"use client";

import { useActionState, useState } from "react";
import {
  deleteAdminCompany,
  type AdminCompanyActionState,
} from "@/lib/actions/admin-companies";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialState: AdminCompanyActionState = { ok: false };

export default function AdminCompanyActions({
  companyId,
}: {
  companyId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteAdminCompany, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
      >
        Remove company
      </button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        title="Remove company"
        description="Remove this company, its jobs, and its applications? Employer accounts stay, but they lose this company. This cannot be undone."
        confirmLabel="Remove company"
        pendingLabel="Removing…"
        formAction={formAction}
      >
        <input type="hidden" name="companyId" value={companyId} />
      </ConfirmModal>

      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </div>
  );
}
