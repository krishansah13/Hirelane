import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getHomePath, type UserRole } from "@/lib/roles";

const LINK_CLASS =
    "text-sm font-medium text-gray-500 transition-colors hover:text-[#2E46BA]";

type FooterLink = { href: string; label: string };

function getFooterLinks(role?: UserRole | null): FooterLink[] {
    if (role === "seeker") {
        return [
            { href: "/dashboard", label: "Applications" },
            { href: "/jobs", label: "Find jobs" },
            { href: "/account", label: "Account" },
        ];
    }

    if (role === "employer") {
        return [
            { href: "/employer", label: "Posted roles" },
            { href: "/employer/jobs/new", label: "Post a job" },
            { href: "/account", label: "Account" },
        ];
    }

    if (role === "admin") {
        return [
            { href: "/admin", label: "Overview" },
            { href: "/admin/approvals", label: "Approvals" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/jobs", label: "Jobs" },
            { href: "/admin/companies", label: "Companies" },
            { href: "/account", label: "Account" },
        ];
    }

    return [
        { href: "/jobs", label: "Browse jobs" },
        { href: "/login", label: "Sign in" },
        { href: "/signup?role=employer", label: "Post a job" },
    ];
}

export default async function FooterSection() {
    const session = await auth();
    const role = session?.user?.role;
    const links = getFooterLinks(role);
    const homeHref = role ? getHomePath(role) : "/";

    return (
        <footer className="mt-auto border-t border-[#eeeaf8] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link prefetch={false}
                        href={homeHref}
                        className="inline-flex shrink-0 items-center gap-2.5"
                    >
                        <Image
                            src="/images/hirelane_brand_mark.png"
                            alt=""
                            width={28}
                            height={28}
                        />
                        <span className="text-lg font-semibold tracking-tight text-[#2E46BA]">
                            Hirelane
                        </span>
                    </Link>

                    <nav
                        aria-label="Footer"
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end"
                    >
                        {links.map((link) => (
                            <Link prefetch={false}
                                key={`${link.href}-${link.label}`}
                                href={link.href}
                                className={LINK_CLASS}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <p className="mt-4 max-w-lg text-sm leading-6 text-gray-400">
                    Find work that fits you, or hire from the lane that leads to
                    your next teammate.
                </p>

                <div className="mt-8 border-t border-[#eeeaf8] pt-6">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Hirelane. Modern
                        recruitment excellence.
                    </p>
                </div>
            </div>
        </footer>
    );
}
