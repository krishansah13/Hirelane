import Link from "next/link";
import {
    Briefcase,
    Clock,
    FilePenLine,
    GraduationCap,
    Wifi,
} from "lucide-react";

const categories = [
    {
        href: "/jobs?type=full-time",
        label: "Full-time",
        description: "Permanent roles with growing teams",
        icon: Briefcase,
    },
    {
        href: "/jobs?remote=true",
        label: "Remote",
        description: "Work from anywhere opportunities",
        icon: Wifi,
    },
    {
        href: "/jobs?type=internship",
        label: "Internships",
        description: "Start your career with intent",
        icon: GraduationCap,
    },
    {
        href: "/jobs?type=contract",
        label: "Contract",
        description: "Project-based and freelance work",
        icon: FilePenLine,
    },
    {
        href: "/jobs?type=part-time",
        label: "Part-time",
        description: "Flexible hours that fit your life",
        icon: Clock,
    },
];

export default function LandingCategories() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
                <div className="max-w-xl">
                    <p className="text-sm font-medium tracking-wide text-gray-400">
                        BROWSE BY TYPE
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                        Choose how you want to work.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Jump into a category and we will take you straight to
                        matching roles.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <Link prefetch={false}
                                key={category.href}
                                href={category.href}
                                className="group rounded-2xl bg-[#fbf9ff] p-5 ring-1 ring-[#eeeaf8] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(76,61,130,0.10)]"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2E46BA] ring-1 ring-[#dcd8ea]">
                                    <Icon size={18} />
                                </span>
                                <h3 className="mt-4 text-sm font-semibold text-gray-950 group-hover:text-[#2E46BA]">
                                    {category.label}
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    {category.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
