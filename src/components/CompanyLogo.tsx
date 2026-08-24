const SIZE = {
    sm: "h-7 w-7 rounded-lg text-[10px]",
    md: "h-10 w-10 rounded-lg text-[13px] sm:h-12 sm:w-12 sm:rounded-xl sm:text-sm",
    lg: "h-11 w-11 rounded-xl text-sm",
} as const;

const PALETTE = [
    { bg: "#2E46BA", fg: "#ffffff" },
    { bg: "#0F766E", fg: "#ffffff" },
    { bg: "#7C3AED", fg: "#ffffff" },
    { bg: "#C2410C", fg: "#ffffff" },
    { bg: "#0369A1", fg: "#ffffff" },
    { bg: "#15803D", fg: "#ffffff" },
    { bg: "#4338CA", fg: "#ffffff" },
    { bg: "#BE185D", fg: "#ffffff" },
] as const;

const KNOWN_MARKS: Record<string, { bg: string; fg: string }> = {
    technova: { bg: "#2E46BA", fg: "#ffffff" },
    cloudpeak: { bg: "#0369A1", fg: "#ffffff" },
    finora: { bg: "#0F766E", fg: "#ffffff" },
    healthsync: { bg: "#BE185D", fg: "#ffffff" },
    pixelforge: { bg: "#7C3AED", fg: "#ffffff" },
    greengrid: { bg: "#15803D", fg: "#ffffff" },
};

function initials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "HL";
}

function hashName(value: string) {
    let hash = 0;
    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return Math.abs(hash);
}

function isUsableLogo(src?: string | null) {
    if (!src) return false;
    const value = src.trim().toLowerCase();
    if (!value) return false;
    return !value.includes("placehold.co") && !value.includes("placeholder");
}

function BrandMark({ slug, name }: { slug?: string; name: string }) {
    const key = slug?.toLowerCase();

    if (key === "technova") {
        return (
            <svg viewBox="0 0 32 32" className="h-[60%] w-[60%]" aria-hidden>
                <path
                    d="M7 26V6h5.4l7.8 12.6V6H26v20h-5.4L12.8 13.4V26H7Z"
                    fill="currentColor"
                />
            </svg>
        );
    }

    if (key === "cloudpeak") {
        return (
            <svg viewBox="0 0 32 32" className="h-[58%] w-[58%]" aria-hidden>
                <path d="M16 5 28 26H4L16 5Z" fill="currentColor" opacity="0.38" />
                <path d="M16 11 24 26H8L16 11Z" fill="currentColor" />
            </svg>
        );
    }

    if (key === "finora") {
        return (
            <svg viewBox="0 0 32 32" className="h-[56%] w-[56%]" aria-hidden>
                <rect x="5" y="18" width="6" height="9" rx="1.5" fill="currentColor" />
                <rect x="13" y="12" width="6" height="15" rx="1.5" fill="currentColor" />
                <rect x="21" y="6" width="6" height="21" rx="1.5" fill="currentColor" />
            </svg>
        );
    }

    if (key === "healthsync") {
        return (
            <svg viewBox="0 0 32 32" className="h-[58%] w-[58%]" aria-hidden>
                <path
                    d="M12.5 5.5h7v7h7v7h-7v7h-7v-7h-7v-7h7v-7Z"
                    fill="currentColor"
                />
            </svg>
        );
    }

    if (key === "pixelforge") {
        return (
            <svg viewBox="0 0 32 32" className="h-[56%] w-[56%]" aria-hidden>
                <rect x="5" y="5" width="9" height="9" rx="2" fill="currentColor" />
                <rect x="18" y="5" width="9" height="9" rx="2" fill="currentColor" opacity="0.42" />
                <rect x="5" y="18" width="9" height="9" rx="2" fill="currentColor" opacity="0.42" />
                <rect x="18" y="18" width="9" height="9" rx="2" fill="currentColor" />
            </svg>
        );
    }

    if (key === "greengrid") {
        return (
            <svg viewBox="0 0 32 32" className="h-[60%] w-[60%]" aria-hidden>
                <path
                    d="M16 4c6.4 4.4 10 9.8 10 15.4C26 24.8 21.8 28 16 28S6 24.8 6 19.4C6 13.8 9.6 8.4 16 4Z"
                    fill="currentColor"
                />
                <path
                    d="M16 10v12M11 18h10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return <span>{initials(name)}</span>;
}

export default function CompanyLogo({
    name,
    slug,
    src,
    size = "md",
    className = "",
}: {
    name: string;
    slug?: string;
    src?: string | null;
    size?: keyof typeof SIZE;
    className?: string;
}) {
    const known = slug ? KNOWN_MARKS[slug.toLowerCase()] : undefined;
    const fallback = PALETTE[hashName(name || slug || "hirelane") % PALETTE.length];
    const colors = known ?? fallback;

    if (isUsableLogo(src)) {
        return (
            <span
                className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-gray-100 ${SIZE[size]} ${className}`}
            >
                <img
                    src={src!}
                    alt={name}
                    className="h-full w-full object-contain p-1.5"
                />
            </span>
        );
    }

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center font-semibold tracking-tight ${SIZE[size]} ${className}`}
            style={{ backgroundColor: colors.bg, color: colors.fg }}
            aria-hidden
        >
            <BrandMark slug={slug} name={name} />
        </span>
    );
}
