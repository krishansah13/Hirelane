import { ClipboardCheck, Search, Send } from "lucide-react";

const steps = [
    {
        title: "Search with intent",
        description:
            "Filter by title, city, or remote and find roles that actually match how you want to work.",
        icon: Search,
    },
    {
        title: "Apply from one place",
        description:
            "Open a role, review the details, and apply without bouncing across a dozen company sites.",
        icon: Send,
    },
    {
        title: "Track your path",
        description:
            "Sign in as a seeker to keep applications, saved roles, and next steps in one dashboard.",
        icon: ClipboardCheck,
    },
];

export default function LandingHowItWorks() {
    return (
        <section className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
                <div className="max-w-xl">
                    <p className="text-sm font-medium tracking-wide text-gray-400">
                        HOW HIRELANE WORKS
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                        A shorter lane from search to hired.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Three steps. No noise. Built for candidates who want
                        clarity and employers who want signal.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <article
                                key={step.title}
                                className="rounded-2xl bg-[#fbf9ff] p-6 ring-1 ring-[#eeeaf8]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2E46BA] ring-1 ring-[#dcd8ea]">
                                        <Icon size={18} />
                                    </span>
                                    <span className="text-xs font-semibold tracking-wide text-gray-400">
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-gray-950">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {step.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
