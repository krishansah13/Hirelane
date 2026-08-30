import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getHomePath, type UserRole } from "@/lib/roles";

const LINK_CLASS =
    "text-sm text-gray-500 transition-colors hover:text-[#2E46BA]";

type FooterLink = { href: string; label: string };
type FooterColumn = { heading: string; links: FooterLink[] };

function getFooterColumns(role?: UserRole | null): FooterColumn[] {
    if (role === "seeker") {
        return [
            {
                heading: "Your workspace",
                links: [
                    { href: "/dashboard", label: "Applications" },
                    { href: "/jobs", label: "Find jobs" },
                    { href: "/account", label: "Account" },
                ],
            },
        ];
    }

    if (role === "employer") {
        return [
            {
                heading: "Your workspace",
                links: [
                    { href: "/employer", label: "Posted roles" },
                    { href: "/employer/jobs/new", label: "Post a job" },
                    { href: "/account", label: "Account" },
                ],
            },
        ];
    }

    if (role === "admin") {
        return [
            {
                heading: "Your workspace",
                links: [
                    { href: "/admin", label: "Overview" },
                    { href: "/admin/users", label: "Users" },
                    { href: "/admin/jobs", label: "Jobs" },
                    { href: "/admin/companies", label: "Companies" },
                    { href: "/account", label: "Account" },
                ],
            },
        ];
    }

    return [
        {
            heading: "For candidates",
            links: [
                { href: "/jobs", label: "Browse jobs" },
                { href: "/login", label: "Sign in" },
            ],
        },
        {
            heading: "For employers",
            links: [
                { href: "/signup?role=employer", label: "Post a job" },
                { href: "/login", label: "Manage roles" },
            ],
        },
    ];
}

function getLegalLinks(role?: UserRole | null): FooterLink[] {
    const home: FooterLink = { href: "/", label: "Home" };

    if (role === "employer" || role === "admin") {
        return [home, { href: getHomePath(role), label: "Dashboard" }];
    }

    return [home, { href: "/jobs", label: "Jobs" }];
}

export default async function FooterSection() {
    const session = await auth();
    const role = session?.user?.role;
    const columns = getFooterColumns(role);
    const legalLinks = getLegalLinks(role);

    return (
        <footer className="mt-auto border-t border-[#eeeaf8] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
                <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
                    <div className="max-w-sm">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <Image
                                src="/images/hirelane_brand_mark.png"
                                alt="Hirelane"
                                width={30}
                                height={30}
                            />
                            <span className="text-lg font-semibold tracking-tight text-[#2E46BA]">
                                Hirelane
                            </span>
                        </Link>
                        <p className="mt-4 text-sm leading-6 text-gray-500">
                            Find work that fits you, or hire from the lane that
                            leads to your next teammate.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-12 sm:gap-16">
                        {columns.map((column) => (
                            <div key={column.heading}>
                                <h3 className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                                    {column.heading}
                                </h3>
                                <div className="mt-4 flex flex-col gap-2.5">
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
                </div>

                <div className="my-8 h-px bg-[#eeeaf8]" />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Hirelane. Modern
                        recruitment excellence.
                    </p>

                    <div className="flex items-center gap-6">
                        {legalLinks.map((link) => (
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
            </div>
        </footer>
    );
}
