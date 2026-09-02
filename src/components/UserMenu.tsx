"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, FileText, User } from "lucide-react";

type UserMenuProps = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
    };
};

export default function UserMenu({ user }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!confirmOpen) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setConfirmOpen(false);
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [confirmOpen]);

    function requestSignOut() {
        setOpen(false);
        setConfirmOpen(true);
    }

    function cancelSignOut() {
        setConfirmOpen(false);
    }

    function confirmSignOut() {
        signOut({ callbackUrl: "/" });
    }

    const initial =
        user.name?.charAt(0)?.toUpperCase() ??
        user.email?.charAt(0)?.toUpperCase() ??
        "U";

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E46BA]/40"
            >
                <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#eef0ff] text-xs font-semibold text-[#2E46BA]">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initial
                    )}
                </span>

                <span className="hidden max-w-35 truncate text-sm font-medium text-gray-700 lg:inline">
                    {user.name ?? "Account"}
                </span>

                <svg
                    className={`hidden h-4 w-4 text-gray-400 transition-transform lg:block ${open ? "rotate-180" : ""
                        }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                >
                    {/* User info */}
                    <div className="border-b border-gray-100 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef0ff] text-sm font-semibold text-[#2E46BA]">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {user.name ?? "User"}
                                </p>

                                {user.email && (
                                    <p className="truncate text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                        <Link prefetch={false}
                            href="/account"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-[#f5f6ff] hover:text-[#2E46BA]"
                        >
                            <User className="h-4 w-4" />
                            Account
                        </Link>

                        {user.role === "seeker" ? (
                            <Link prefetch={false}
                                href="/account#resumes"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-[#f5f6ff] hover:text-[#2E46BA]"
                            >
                                <FileText className="h-4 w-4" />
                                Resumes
                            </Link>
                        ) : null}

                        <div className="my-1 border-t border-gray-100" />

                        <button
                            type="button"
                            role="menuitem"
                            onClick={requestSignOut}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}

            {mounted &&
                confirmOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
                        onClick={cancelSignOut}
                        role="presentation"
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="sign-out-title"
                            aria-describedby="sign-out-description"
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <h2
                                id="sign-out-title"
                                className="text-lg font-bold text-gray-950"
                            >
                                Sign out
                            </h2>

                            <p
                                id="sign-out-description"
                                className="mt-2 text-sm leading-6 text-gray-600"
                            >
                                Are you sure you want to sign out?
                            </p>

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={cancelSignOut}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmSignOut}
                                    className="rounded-xl bg-[#2E46BA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
