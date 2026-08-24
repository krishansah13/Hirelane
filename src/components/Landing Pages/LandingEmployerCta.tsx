import { auth } from "@/auth";
import { redirect } from "next/dist/server/api-utils";
import Link from "next/link";

export default async function LandingEmployerCta() {
    const session = await auth();

    if (session?.user?.role !== "seeker") {
    return (
        <section className=" pb-16">
            <div className="mx-auto max-w-6xl px-6 sm:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-[#1739ad] px-8 py-12 sm:px-12">
                    <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-indigo-300/20 blur-2xl" />

                    <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl">
                            <p className="text-sm font-medium tracking-wide text-indigo-200">
                                FOR EMPLOYERS
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                                Hiring? Put the right role in front of people
                                already looking.
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-indigo-100">
                                Post a job, review applicants, and manage your
                                pipeline from the employer dashboard.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/employer"
                                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1739ad] transition hover:bg-indigo-50"
                            >
                                Post a job
                            </Link>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Explore open roles
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
    }
    return;
}
