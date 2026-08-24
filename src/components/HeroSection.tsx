import { JobSearchProps } from "@/types/JobTypes";
import SearchForm from "./SearchForm";

export default function HeroSection({params}: {params: JobSearchProps}) {
    return (
        <div className="min-h-100 bg-linear-100 from-white via-white to-indigo-400 p-7">
            <section className="w-full text-center">
                <p className="text-sm font-medium text-gray-400">
                    HIRELANE JOBS
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                    Find work that fits you.
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                    Discover opportunities from companies looking
                    for people like you.
                </p>
            </section>

            <section className="mx-auto mt-10 max-w-5xl">
                <SearchForm params={params} />
            </section>
        </div>
    );
}