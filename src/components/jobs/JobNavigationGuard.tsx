"use client";

import { useEffect, useState } from "react";

type JobNavigationGuardProps = {
  hasChanges: boolean;
  onSaveDraft: () => Promise<void>;
};

export default function JobNavigationGuard({
  hasChanges,
  onSaveDraft,
}: JobNavigationGuardProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!hasChanges) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("http")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setPendingHref(href);
      setShowPrompt(true);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [hasChanges]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasChanges) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  async function saveAndNavigate() {
    if (!pendingHref) return;

    setIsSaving(true);

    try {
      await onSaveDraft();
      window.location.href = pendingHref;
    } finally {
      setIsSaving(false);
    }
  }

  function discardAndNavigate() {
    if (!pendingHref) return;

    window.location.href = pendingHref;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-gray-950">Unsaved changes</h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          You have unsaved changes. Save them as a draft before leaving?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={discardAndNavigate}
            disabled={isSaving}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveAndNavigate}
            disabled={isSaving}
            className="rounded-xl bg-[#2e46ba] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
