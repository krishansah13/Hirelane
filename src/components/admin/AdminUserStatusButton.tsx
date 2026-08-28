"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  setUserAccountStatus,
  type AdminUserActionState,
} from "@/lib/actions/admin-users";
import type { AccountStatus } from "@/lib/roles";

const initialState: AdminUserActionState = { ok: false };

function SubmitButton({
  nextStatus,
}: {
  nextStatus: AccountStatus;
}) {
  const { pending } = useFormStatus();
  const isSuspend = nextStatus === "suspended";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
        isSuspend
          ? "text-rose-700 hover:bg-rose-50"
          : "bg-[#eef0ff] text-[#2e46ba] hover:bg-indigo-100"
      }`}
    >
      {pending
        ? isSuspend
          ? "Suspending…"
          : "Restoring…"
        : isSuspend
          ? "Suspend"
          : "Restore"}
    </button>
  );
}

export default function AdminUserStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: AccountStatus;
}) {
  const [state, formAction] = useActionState(setUserAccountStatus, initialState);
  const nextStatus: AccountStatus =
    status === "suspended" ? "active" : "suspended";

  return (
    <div className="flex flex-col items-start gap-1">
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="status" value={nextStatus} />
        <SubmitButton nextStatus={nextStatus} />
      </form>
      {state.error ? (
        <p className="text-xs text-rose-600">{state.error}</p>
      ) : null}
    </div>
  );
}
