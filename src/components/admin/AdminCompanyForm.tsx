"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateAdminCompany,
  type AdminCompanyActionState,
} from "@/lib/actions/admin-companies";

const initialState: AdminCompanyActionState = { ok: false };

const FIELD_CLASS =
  "h-11 w-full rounded-xl bg-[#fbf9ff] px-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA]";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-xl bg-[#1739ad] px-5 text-sm font-semibold text-white transition hover:bg-[#12329c] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function AdminCompanyForm({
  companyId,
  name,
  website,
  about,
}: {
  companyId: string;
  name: string;
  website: string;
  about: string;
}) {
  const [state, formAction] = useActionState(updateAdminCompany, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="companyId" value={companyId} />

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          Company name
        </span>
        <input
          name="name"
          type="text"
          defaultValue={name}
          required
          minLength={2}
          maxLength={80}
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          Website
        </span>
        <input
          name="website"
          type="text"
          defaultValue={website}
          required
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-gray-500">
          About
        </span>
        <textarea
          name="about"
          defaultValue={about}
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl bg-[#fbf9ff] px-3 py-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA]"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-rose-600">{state.error}</p>
      ) : state.ok ? (
        <p className="text-sm text-emerald-700">Company details saved.</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
