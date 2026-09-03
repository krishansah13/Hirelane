"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LoggingInLinks() {
    const pathname = usePathname();
    if (pathname.startsWith("/login")) {
        return <Link prefetch={false}
            href="/signup"
            className="hidden rounded-md border border-[#2E46BA] px-4 py-2 text-sm font-medium text-[#2E46BA] transition hover:bg-[#2E46BA]/5 sm:inline-flex sm:px-5"
        >
            Sign up
        </Link>
    } else if (pathname.startsWith("/signup")) {
        return <Link prefetch={false}
            href="/login"
            className="rounded-md border border-[#2E46BA] bg-[#2E46BA] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1739ad] sm:px-6"
        >
            Sign in
        </Link>
    }
    return (
        <>
            <Link prefetch={false}
                href="/signup"
                className="hidden rounded-md border border-[#2E46BA] px-4 py-2 text-sm font-medium text-[#2E46BA] transition hover:bg-[#2E46BA]/5 sm:inline-flex sm:px-5"
            >
                Sign up
            </Link>
            <Link prefetch={false}
                href="/login"
                className="rounded-md border border-[#2E46BA] bg-[#2E46BA] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1739ad] sm:px-6"
            >
                Sign in
            </Link>
        </>
    )
}
