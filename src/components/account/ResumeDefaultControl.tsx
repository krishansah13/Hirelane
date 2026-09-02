"use client";

import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import type { SavedResume } from "@/lib/utils/resume";

function DefaultButton({ busy }: { busy?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || busy;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#f5f6ff] hover:text-[#2E46BA] disabled:opacity-70"
    >
      {pending ? "Updating..." : "Use when applying"}
    </button>
  );
}

export default function ResumeDefaultControl({
  resume,
  defaultAction,
  busy,
}: {
  resume: SavedResume;
  defaultAction: (formData: FormData) => void;
  busy?: boolean;
}) {
  if (resume.isDefault) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0ff] px-3 py-1 text-xs font-medium text-[#2e46ba]">
        <Star size={12} />
        Used when applying
      </span>
    );
  }

  return (
    <form action={defaultAction}>
      <input type="hidden" name="resumeId" value={resume.id} />
      <DefaultButton busy={busy} />
    </form>
  );
}
