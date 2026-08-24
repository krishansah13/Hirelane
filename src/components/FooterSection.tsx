import Link from "next/link";

const LINK_CLASS =
    "text-xs text-[#3f3b4a] transition-colors hover:text-[#4f46e5]";

const COLUMNS = [
    {
        heading: "For Candidates",
        links: [
            { href: "/jobs", label: "Browse Jobs" },
            { href: "/dashboard", label: "My Applications" },
        ],
    },
    {
        heading: "For Employers",
        links: [
            { href: "/employer/jobs/new", label: "Post a Job" },
            { href: "/employer", label: "Manage Roles" },
        ],
    },
];

export default function FooterSection() {
    return (
        <footer className="bg-[#f7f5ff]">
            <div className="mx-auto max-w-7xl px-8 py-16">
                <div className="flex flex-wrap gap-16 sm:gap-32">
                    {COLUMNS.map((column) => (
                        <div key={column.heading}>
                            <h3 className="text-sm font-medium text-[#17151c]">
                                {column.heading}
                            </h3>

                            <div className="mt-3 flex flex-col gap-2">
                                {column.links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={LINK_CLASS}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="my-8 h-px bg-[#dcd8ea]" />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-[#3f3b4a]">
                        &copy; {new Date().getFullYear()} Hirelane. Modern
                        Recruitment Excellence.
                    </p>

                    <div className="flex items-center gap-7">
                        <Link href="/" className={LINK_CLASS}>
                            Home
                        </Link>
                        <Link href="/jobs" className={LINK_CLASS}>
                            Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
