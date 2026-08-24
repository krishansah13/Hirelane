"use client";

import { AlertTriangle, Briefcase, RefreshCw } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <StatusScreen
            eyebrow="Something went wrong"
            icon={AlertTriangle}
            tone="danger"
            title="We hit a snag"
            description={
                error.digest
                    ? `An unexpected error occurred while loading this page. Reference: ${error.digest}`
                    : "An unexpected error occurred while loading this page. Try again, or head back to keep browsing opportunities."
            }
            secondaryAction={{ href: "/jobs", label: "Browse jobs", icon: Briefcase }}
        >
            <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e46ba] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1739ad]"
            >
                <RefreshCw size={16} />
                Try again
            </button>
        </StatusScreen>
    );
}
