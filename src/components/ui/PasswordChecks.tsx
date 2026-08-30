import { Check, X } from "lucide-react";
import { PASSWORD_CHECKS } from "@/lib/validation";

export default function PasswordChecks({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1.5" aria-live="polite">
      {PASSWORD_CHECKS.map((check) => {
        const passed = check.test(password);
        return (
          <li
            key={check.id}
            className={`flex items-center gap-2 text-xs transition-colors ${
              passed ? "text-emerald-600" : "text-red-400"
            }`}
          >
            {passed ? (
              <Check size={13} strokeWidth={2.4} className="shrink-0" />
            ) : (
              <X size={13} strokeWidth={2} className="shrink-0" />
            )}
            {check.label}   
          </li>
        );
      })}
    </ul>
  );
}
