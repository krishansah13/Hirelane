import { JobSearchProps } from "@/types/JobTypes";
import { Search, MapPin, ArrowRight } from "lucide-react";

const FIELD_CLASS =
    "flex h-14 items-center px-4 sm:h-full sm:flex-1 sm:px-0";

// text-[16px] keeps iOS Safari from zooming in on focus.
const INPUT_CLASS =
    "h-full w-full min-w-0 bg-transparent text-[16px] font-normal outline-none placeholder:text-[#a5a4ae]";

const ICON_CLASS = "mr-3 shrink-0 text-[#484855] sm:mr-4";

export default function SearchForm({
    params,
}: {
    params: JobSearchProps;
}) {
    return (
        <form
            action="/jobs"
            method="GET"
            className="flex w-full flex-col gap-2.5 sm:h-[70px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-2xl sm:bg-[#fbf9ff] sm:px-3 sm:shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
        >
            {/*
              On mobile both fields share one white card so the search reads as a
              single control. `sm:contents` dissolves the card on larger screens
              so the fields sit directly in the horizontal search bar.
            */}
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
                        defaultValue={params.q}
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
                        type="text"
                        defaultValue={params.location}
                        placeholder="City or location"
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            {params.type && (
                <input type="hidden" name="type" value={params.type} />
            )}

            {params.remote && (
                <input type="hidden" name="remote" value={params.remote} />
            )}

            {params.sort && (
                <input type="hidden" name="sort" value={params.sort} />
            )}

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
