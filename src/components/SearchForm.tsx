"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";

const FIELD_CLASS =
    "flex h-14 items-center px-4 sm:h-full sm:flex-1 sm:px-0";

const INPUT_CLASS =
    "h-full w-full min-w-0 bg-transparent text-[16px] font-normal outline-none placeholder:text-[#a5a4ae]";

const ICON_CLASS = "mr-3 shrink-0 text-[#484855] sm:mr-4";

export default function SearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [location, setLocation] = useState(
        searchParams.get("location") ?? ""
    );

    useEffect(() => {
        setQ(searchParams.get("q") ?? "");
        setLocation(searchParams.get("location") ?? "");
    }, [searchParams]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const params = new URLSearchParams();

        if (q.trim()) {
            params.set("q", q.trim());
        }

        if (location.trim()) {
            params.set("location", location.trim());
        }

        const type = searchParams.get("type");
        const remote = searchParams.get("remote");
        const sort = searchParams.get("sort");

        if (type) params.set("type", type);
        if (remote) params.set("remote", remote);
        if (sort) params.set("sort", sort);

        router.push(`/jobs?${params.toString()}`);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2.5 sm:h-[70px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-2xl sm:bg-[#fbf9ff] sm:px-3 sm:shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
        >
            <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(76,61,130,0.10)] sm:contents">
                <div className={FIELD_CLASS}>
                    <Search
                        size={18}
                        strokeWidth={2.2}
                        className={`${ICON_CLASS} sm:ml-2`}
                    />

                    <input
                        name="q"
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Job title or keyword"
                        className={INPUT_CLASS}
                    />
                </div>

                <div className="h-px w-full bg-[#eeeaf8] sm:h-[38px] sm:w-px sm:bg-[#c9c6d1]" />

                <div className={FIELD_CLASS}>
                    <MapPin
                        size={18}
                        strokeWidth={2.2}
                        className={`${ICON_CLASS} sm:ml-5`}
                    />

                    <input
                        name="location"
                        type="search"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City or location"
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            <button
                type="submit"
                className="flex h-13 w-full shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-[#1739ad] text-[16px] font-semibold text-white shadow-[0_4px_16px_rgba(23,57,173,0.25)] transition hover:bg-[#12329c] sm:h-12 sm:w-32 sm:rounded-xl sm:shadow-none"
            >
                Search
                <ArrowRight size={20} />
            </button>
        </form>
    );
}
