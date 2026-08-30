"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  createAdminEmployer,
  type AdminUserActionState,
} from "@/lib/actions/admin-users";

const initialState: AdminUserActionState = { ok: false };

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
      {pending ? "Adding…" : "Add employer"}
    </button>
  );
}

export default function AdminAddEmployer({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, formAction] = useActionState(createAdminEmployer, initialState);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      return;
    }

    if (!state.values) return;
    setName(state.values.name);
    setEmail(state.values.email);
    setPassword(state.values.password);
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
        className="rounded-lg bg-[#eef0ff] px-3 mt-1 py-1.5 text-sm font-medium text-[#2E46BA] transition hover:bg-indigo-100 cursor-pointer"
      >
        Add employer
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
              aria-labelledby="add-employer-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="add-employer-title"
                className="text-lg font-semibold text-gray-950"
              >
                Add employer
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Create an employer account linked to this company. They can
                sign in and manage roles right away.
              </p>

              <form action={formAction} className="mt-6 space-y-4">
                <input type="hidden" name="companyId" value={companyId} />

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-500">
                    Full name
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
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={FIELD_CLASS}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-500">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={100}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${FIELD_CLASS} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484855] transition hover:text-gray-950"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
