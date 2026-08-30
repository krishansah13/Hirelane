"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import {
  createAdminCompany,
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
      className="rounded-xl bg-[#2e46ba] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Adding…" : "Add company"}
    </button>
  );
}

export default function AdminAddCompany() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, formAction] = useActionState(createAdminCompany, initialState);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state.values) return;
    setName(state.values.name);
    setWebsite(state.values.website);
    setAbout(state.values.about);
    if (state.error) setOpen(true);
  }, [state]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#2e46ba] px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Add Company
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-company-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="add-company-title"
                className="text-lg font-bold text-gray-950"
              >
                Add company
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Create a company profile. You can attach employers and jobs
                later.
              </p>

              <form action={formAction} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-500">
                    Company name
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
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
                    required
                    placeholder="https://example.com"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-500">
                    About{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </span>
                  <textarea
                    name="about"
                    rows={4}
                    maxLength={2000}
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    className="w-full rounded-xl bg-[#fbf9ff] px-3 py-3 text-sm text-gray-950 outline-none ring-1 ring-[#dcd8ea] focus:ring-2 focus:ring-[#2E46BA]"
                  />
                </label>

                {state.error ? (
                  <p className="text-sm text-rose-600">{state.error}</p>
                ) : null}

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
