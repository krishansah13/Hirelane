import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getHomePath } from "@/lib/roles";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
    title: "Sign up | Hirelane",
    description:
        "Create a Hirelane account to apply for roles or post jobs for your company.",
};

function SignupFallback() {
    return (
        <main className="flex flex-1 items-center justify-center bg-linear-100 from-white via-white to-indigo-300 px-6 py-16">
            <div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-white/80 shadow-[0_10px_30px_rgba(76,61,130,0.10)]" />
        </main>
    );
}

export default async function SignupPage() {
    const session = await auth();

    if (session?.user) {
        redirect(getHomePath(session.user.role));
    }

    return (
        <Suspense fallback={<SignupFallback />}>
            <SignupForm />
        </Suspense>
    );
}
