import Link from "next/link";
import SearchForm from "./SearchForm";

type LandingStats = {
    openRoles: number;
    companies: number;
    remoteRoles: number;
};

const popularSearches = [
    { label: "Frontend Developer", href: "/jobs?q=Frontend+Developer" },
    { label: "Product Designer", href: "/jobs?q=Product+Designer" },
    { label: "Software Engineer", href: "/jobs?q=Software+Engineer" },
    { label: "Bengaluru", href: "/jobs?location=Bengaluru" },
    { label: "Remote", href: "/jobs?remote=true" },
    { label: "Internship", href: "/jobs?type=internship" },
];

function formatStat(value: number) {
    return value.toLocaleString("en-IN");
}

export default function LandingHero({ stats }: { stats: LandingStats }) {
    const items = [
        { value: stats.openRoles, label: "open roles" },
        { value: stats.companies, label: "companies hiring" },
        { value: stats.remoteRoles, label: "remote roles" },
    ].filter((item) => item.value > 0);

    return (
        <section className="relative overflow-hidden bg-linear-100 from-white via-white to-indigo-300">
            <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-8 h-48 w-48 rounded-full bg-[#2E46BA]/10 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
                <div className="text-center">
                    <p className="text-sm font-medium tracking-wide text-gray-400">
                        HIRELANE JOBS
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950 sm:text-6xl">
                        Find work that fits you.
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                        Search roles from companies hiring now, apply from one
                        place, and stay on the lane that leads to your next job.
                    </p>
                </div>

                <div className="mx-auto mt-10 max-w-5xl">
                    <SearchForm params={{}} />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                        Popular:
                    </span>
                    {popularSearches.map((search) => (
                        <Link
                            key={search.href}
                            href={search.href}
                            className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-[#dcd8ea] transition hover:text-[#2E46BA] hover:ring-[#2E46BA]/30"
                        >
                            {search.label}
                        </Link>
                    ))}
                </div>

                {items.length > 0 && (
                    <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
                        {items.map((item) => (
                            <div key={item.label} className="text-center">
                                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {item.label}
                                </dt>
                                <dd className="mt-1 text-2xl font-semibold tracking-tight text-[#2E46BA]">
                                    {formatStat(item.value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </section>
    );
}
