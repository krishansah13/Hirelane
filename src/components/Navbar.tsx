"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { getHomePath, type UserRole } from "@/lib/roles";
import UserMenu from "./UserMenu";

type NavLink = { href: string; label: string };

const BROWSE_LINKS: NavLink[] = [
    { href: "/jobs", label: "Find Jobs" },
];

/**
 * Seekers get no third link: their only destination is the dashboard, which
 * the account cluster on the right already owns.
 */
function getNavLinks(role?: UserRole): NavLink[] {
    const dashboardHref = getHomePath(role);

    if (role === "seeker") {
        return [
            { href: dashboardHref, label: "Dashboard" },
            ...BROWSE_LINKS,
        ];
    }

    if (role === "employer") {
        return [
            { href: dashboardHref, label: "Dashboard" },
            { href: "/employer/jobs/new", label: "Post a Job" },
        ];
    }

    if (role === "admin") {
        return [
            { href: dashboardHref, label: "Dashboard" },
            { href: "/admin/approvals", label: "Approvals" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/jobs", label: "Jobs" },
            { href: "/admin/companies", label: "Companies" },
        ];
    }

    return [
        { href: "/login", label: "Dashboard" },
        { href: "/login", label: "Post a Job" },
        ...BROWSE_LINKS,
    ];
}

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const isSessionLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.user;
    const role = isAuthenticated ? session.user.role : undefined;
    const dashboardHref = getHomePath(role);
    const links = isSessionLoading ? [] : getNavLinks(role);

    function isActive(href: string) {
        if (href.startsWith("/#")) return false;
        const path = href.split("?")[0];
        if (path === "/jobs" || path === "/admin") {
            return pathname === path;
        }
        return pathname.startsWith(path);
    }

    function linkClass(href: string) {
        return `text-sm font-medium transition ${isActive(href)
            ? "text-[#2E46BA]"
            : "text-gray-950 hover:text-[#2E46BA]"
            }`;
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-[#eeeaf8] bg-white/80 backdrop-blur">
            <div className="mx-auto flex justify-between h-16 items-center gap-4 px-4 sm:px-8">
                <div className="flex justify-start">
                    <Link prefetch={false}
                        href={isAuthenticated ? dashboardHref : "/"}
                        className="flex items-center gap-3"
                    >
                        <Image
                            src="/images/hirelane_brand_mark.png"
                            alt="HireLane"
                            width={30}
                            height={30}
                        />
                        <h1 className="text-xl font-semibold tracking-tight text-[#2E46BA]">
                            Hirelane
                        </h1>
                    </Link>
                </div>

                <div className="hidden items-center justify-center gap-8 md:flex">
                    {isSessionLoading ? (
                        <>
                            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                        </>
                    ) : (
                        links.map((link) => (
                            <Link prefetch={false}
                                key={link.label}
                                href={link.href}
                                className={linkClass(link.href)}
                            >
                                {link.label}
                            </Link>
                        ))
                    )}
                </div>

                <div className="col-start-3 flex items-center justify-end gap-3">
                    {status === "loading" ? (
                        <div className="h-10 w-24 animate-pulse rounded-md bg-gray-100" />
                    ) : isAuthenticated ? (
                        <>
                            <UserMenu user={session.user} />
                        </>
                    ) : (
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
                    )}

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="border-t border-[#eeeaf8] bg-white px-4 py-3 md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        {isSessionLoading ? (
                            <>
                                <div className="h-9 rounded-lg bg-gray-100" />
                                <div className="h-9 rounded-lg bg-gray-100" />
                            </>
                        ) : (
                            links.map((link) => (
                                <Link prefetch={false}
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`rounded-lg px-3 py-2 ${isActive(link.href)
                                        ? "bg-[#eef0ff] text-[#2E46BA]"
                                        : "text-gray-700 hover:bg-gray-50"
                                        } text-sm font-medium`}
                                >
                                    {link.label}
                                </Link>
                            ))
                        )}

                        {!isSessionLoading && !isAuthenticated && (
                            <Link prefetch={false}
                                href="/signup"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:hidden"
                            >
                                Sign up
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
