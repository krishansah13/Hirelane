"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";

function PendingBridge({
  onPending,
}: {
  onPending: (pending: boolean) => void;
}) {
  const { pending } = useFormStatus();

  useEffect(() => {
    onPending(pending);
  }, [onPending, pending]);

  return null;
}

function ConfirmActions({
  label,
  pendingLabel,
  onClose,
}: {
  label: string;
  pendingLabel: string;
  onClose: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={onClose}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-70 sm:w-auto"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#2E46BA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70 sm:w-auto"
      >
        {pending ? pendingLabel : label}
      </button>
    </>
  );
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  pendingLabel = "Working…",
  onClose,
  formAction,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pendingLabel?: string;
  onClose: () => void;
  formAction: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPending(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, pending]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={() => {
        if (!pending) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        aria-busy={pending}
        className="w-full rounded-t-3xl bg-white p-5 pb-8 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6 sm:pb-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-modal-title"
          className="text-lg font-bold text-gray-950"
        >
          {title}
        </h2>
        <p
          id="confirm-modal-description"
          className="mt-2 text-sm leading-6 text-gray-600"
        >
          {description}
        </p>

        <form
          action={formAction}
          className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end"
        >
          <PendingBridge onPending={setPending} />
          {children}
          <ConfirmActions
            label={confirmLabel}
            pendingLabel={pendingLabel}
            onClose={onClose}
          />
        </form>
      </div>
    </div>,
    document.body,
  );
}
