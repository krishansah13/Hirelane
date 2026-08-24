import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type StatusAction = {
    href: string;
    label: string;
    icon?: LucideIcon;
};

type StatusScreenProps = {
    /** Small uppercase kicker above the headline, e.g. "ERROR 404". */
    eyebrow: string;
    /** Oversized watermark behind the icon, e.g. "404". Omit for non-404 states. */
    code?: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone?: "brand" | "danger";
    primaryAction?: StatusAction;
    secondaryAction?: StatusAction;
    /** Rendered under the actions — used for the error boundary's retry button. */
    children?: React.ReactNode;
    footNote?: string;
    /**
     * Set for screens rendered inside a layout that already owns the page
     * background and `<main>` landmark, such as the dashboard shell.
     */
    embedded?: boolean;
};

const TONES = {
    brand: {
        badge: "bg-[#eef0ff] text-[#2E46BA]",
        code: "text-[#2E46BA]/10",
    },
    danger: {
        badge: "bg-rose-50 text-rose-600",
        code: "text-rose-500/10",
    },
} as const;

function ActionLink({
    action,
    variant,
}: {
    action: StatusAction;
    variant: "primary" | "secondary";
}) {
    const Icon = action.icon;
    const styles =
        variant === "primary"
            ? "bg-[#2e46ba] text-white hover:bg-[#1739ad]"
            : "border border-[#dcd8ea] bg-white text-gray-700 hover:bg-[#f7f5ff] hover:text-[#2E46BA]";

    return (
        <Link
            href={action.href}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${styles}`}
        >
            {Icon && <Icon size={16} />}
            {action.label}
        </Link>
    );
}

export default function StatusScreen({
    eyebrow,
    code,
    title,
    description,
    icon: Icon,
    tone = "brand",
    primaryAction,
    secondaryAction,
    children,
    footNote = "Hirelane",
    embedded = false,
}: StatusScreenProps) {
    const toneStyles = TONES[tone];
    const Wrapper = embedded ? "section" : "main";

    return (
        <Wrapper
            className={
                embedded
                    ? "relative flex items-center justify-center px-2 py-10"
                    : "relative flex flex-1 items-center justify-center overflow-hidden bg-linear-100 from-white via-white to-indigo-300 px-6 py-20"
            }
        >
            {!embedded && (
                <>
                    <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
                    <div className="pointer-events-none absolute -left-10 bottom-8 h-48 w-48 rounded-full bg-[#2E46BA]/10 blur-3xl" />
                </>
            )}

            <div className="relative flex w-full max-w-lg flex-col items-center">
                <div className="w-full rounded-2xl bg-white/90 p-10 text-center shadow-[0_10px_30px_rgba(76,61,130,0.10)] ring-1 ring-[#dcd8ea]/70">
                    <div className="relative flex justify-center">
                        {code && (
                            <span
                                aria-hidden
                                className={`pointer-events-none absolute -top-6 select-none text-8xl font-bold tracking-tight ${toneStyles.code}`}
                            >
                                {code}
                            </span>
                        )}
                        <div
                            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${toneStyles.badge}`}
                        >
                            <Icon size={24} />
                        </div>
                    </div>

                    <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">
                        {eyebrow}
                    </p>

                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                        {title}
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                        {description}
                    </p>

                    {(primaryAction || secondaryAction || children) && (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            {children}
                            {primaryAction && (
                                <ActionLink action={primaryAction} variant="primary" />
                            )}
                            {secondaryAction && (
                                <ActionLink
                                    action={secondaryAction}
                                    variant="secondary"
                                />
                            )}
                        </div>
                    )}
                </div>

                <p className="mt-8 text-sm font-medium text-gray-400">{footNote}</p>
            </div>
        </Wrapper>
    );
}
