"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteAdminCompany,
  type AdminCompanyActionState,
} from "@/lib/actions/admin-companies";

const initialState: AdminCompanyActionState = { ok: false };

function RemoveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Removing…" : "Remove company"}
    </button>
  );
}

export default function AdminCompanyActions({
  companyId,
}: {
  companyId: string;
}) {
  const [state, formAction] = useActionState(deleteAdminCompany, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Remove this company, its jobs, and its applications? Employer accounts stay, but they lose this company. This cannot be undone.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="companyId" value={companyId} />
        <RemoveButton />
      </form>
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </div>
  );
}
