"use client";

import { JobSearchProps } from "@/types/JobTypes";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";

const JOB_TYPES = [
    ["full-time", "Full-time"],
    ["part-time", "Part-time"],
    ["contract", "Contract"],
    ["internship", "Internship"],
] as const;

export default function Filters({
    params,
}: {
    params: JobSearchProps;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const id = useId();

    const [open, setOpen] = useState(false);
    const [type, setType] = useState(params.type ?? "");
    const [remote, setRemote] = useState(params.remote ?? "any");
    const [sort, setSort] = useState(params.sort ?? "newest");

    useEffect(() => {
        setType(searchParams.get("type") ?? "");
        setRemote(searchParams.get("remote") ?? "any");
        setSort(searchParams.get("sort") ?? "newest");
    }, [searchParams]);

    useEffect(() => {
        if (!open) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        function onResize() {
            if (window.matchMedia("(min-width: 1024px)").matches) {
                setOpen(false);
            }
        }

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", onResize);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    const activeCount =
        Number(Boolean(type)) +
        Number(remote !== "any") +
        Number(sort === "oldest");

    function nextSearchParams() {
        const next = new URLSearchParams();
        const q = searchParams.get("q");
        const location = searchParams.get("location");

        if (q) next.set("q", q);
        if (location) next.set("location", location);
        if (type) next.set("type", type);
        if (remote !== "any") next.set("remote", remote);
        if (sort) next.set("sort", sort);
        next.set("page", "1");

        return next;
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        router.push(`${pathname}?${nextSearchParams().toString()}`);
        setOpen(false);
    }

    function handleClear() {
        const next = new URLSearchParams();
        const q = searchParams.get("q");
        const location = searchParams.get("location");

        if (q) next.set("q", q);
        if (location) next.set("location", location);
        next.set("page", "1");

        setType("");
        setRemote("any");
        setSort("newest");

        router.push(`${pathname}?${next.toString()}`);
    }

    function fields(namePrefix: string) {
        return (
            <>
                <div>
                    <h3 className="mb-3 text-sm font-medium">Job type</h3>
                    <div className="space-y-3">
                        {JOB_TYPES.map(([value, label]) => (
                            <label
                                key={value}
                                className="flex cursor-pointer items-center gap-3 text-sm text-gray-900"
                            >
                                <input
                                    type="radio"
                                    name={`${namePrefix}-type`}
                                    value={value}
                                    checked={type === value}
                                    onChange={(e) => setType(e.target.value)}
                                    className="h-4 w-4 accent-blue"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-medium">Work mode</h3>
                    <div className="space-y-3">
                        {[
                            ["any", "Any"],
                            ["true", "Remote"],
                            ["false", "On-site"],
                        ].map(([value, label]) => (
                            <label
                                key={value}
                                className="flex cursor-pointer items-center gap-3 text-sm text-gray-900"
                            >
                                <input
                                    type="radio"
                                    name={`${namePrefix}-remote`}
                                    value={value}
                                    checked={remote === value}
                                    onChange={() => setRemote(value)}
                                    className="h-4 w-4 accent-blue"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-medium">Sort by</h3>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-black outline-none focus:border-black"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </>
        );
    }

    return (
        <div>
            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-950 shadow-xs"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                >
                    <span className="flex items-center gap-2">
                        <SlidersHorizontal size={17} />
                        Filters
                    </span>
                    {activeCount > 0 ? (
                        <span className="rounded-full bg-[#2E46BA] px-2 py-0.5 text-xs font-semibold text-white">
                            {activeCount}
                        </span>
                    ) : (
                        <span className="text-xs font-normal text-gray-500">
                            Type, remote, sort
                        </span>
                    )}
                </button>
            </div>

            <aside className="hidden h-fit rounded-2xl p-5 lg:block">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={17} />
                        <h2 className="font-semibold">Filters</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-gray-900 hover:cursor-pointer"
                    >
                        Clear
                    </button>
                </div>
                <hr className="my-5 -mt-3" />
                <form onSubmit={handleSubmit} className="space-y-7">
                    {fields(`${id}-desktop`)}
                    <button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-[#2E46BA] text-sm font-medium text-white transition hover:scale-105 hover:bg-[#2E46BA]/80"
                    >
                        Apply filters
                    </button>
                </form>
            </aside>

            {open ? (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="presentation"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Close filters"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`${id}-sheet-title`}
                        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={17} />
                                <h2
                                    id={`${id}-sheet-title`}
                                    className="font-semibold"
                                >
                                    Filters
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-xs text-gray-900"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="space-y-7 overflow-y-auto px-5 py-5">
                                {fields(`${id}-mobile`)}
                            </div>
                            <div className="border-t border-gray-100 px-5 py-4">
                                <button
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-[#2E46BA] text-sm font-medium text-white transition hover:bg-[#2E46BA]/80"
                                >
                                    Apply filters
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
