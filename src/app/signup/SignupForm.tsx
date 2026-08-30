"use client";

import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
    BriefcaseBusiness,
    Building2,
    Eye,
    EyeOff,
    Globe,
    Lock,
    Mail,
    UserRound,
} from "lucide-react";
import { signup } from "@/lib/actions/signup";
import { getHomePath } from "@/lib/roles";

type Role = "seeker" | "employer";

function getSafeCallbackUrl(value: string | null) {
    if (!value) return null;
    if (
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/login") ||
        value.startsWith("/signup")
    ) {
        return null;
    }
    return value;
}

export default function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [role, setRole] = useState<Role>(
        searchParams.get("role") === "employer" ? "employer" : "seeker",
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfPass, setShowConfPass] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.set("name", name);
            formData.set("email", email.trim().toLowerCase());
            formData.set("password", password);
            formData.set("role", role);
            if (role === "employer") {
                formData.set("companyName", companyName);
                formData.set("companyWebsite", companyWebsite);
            }

            const created = await signup(formData);
            if (!created.ok) {
                setError(created.error ?? "Could not create your account");
                return;
            }

            const result = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            if (!result?.ok) {
                router.push("/login");
                return;
            }

            const session = await getSession();
            const destination =
                getSafeCallbackUrl(searchParams.get("callbackUrl")) ??
                getHomePath(session?.user.role);

            router.push(destination);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="relative flex flex-1 overflow-hidden bg-linear-100 from-white via-white to-indigo-300">
            <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-8 h-48 w-48 rounded-full bg-[#2E46BA]/10 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
                <div className="rounded-2xl bg-white/90 p-8 shadow-[0_10px_30px_rgba(76,61,130,0.10)] ring-1 ring-[#dcd8ea]/70 backdrop-blur-sm">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex items-center gap-2.5">
                            <Image
                                src="/images/hirelane_brand_mark.png"
                                alt="Hirelane"
                                width={32}
                                height={32}
                            />
                            <span className="text-lg font-semibold tracking-tight text-[#2E46BA]">
                                Hirelane
                            </span>
                        </div>

                        <p className="text-xs font-medium tracking-wide text-gray-400">
                            JOIN HIRELANE
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Seekers apply in minutes. Employers post a role the
                            same day. Pick a side and start.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-900">
                                I am here to
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("seeker")}
                                    className={`rounded-xl px-3 py-3 text-left transition ${role === "seeker"
                                            ? "bg-[#eef0ff] ring-2 ring-[#2E46BA]"
                                            : "bg-[#f7f5ff] hover:bg-indigo-50"
                                        }`}
                                >
                                    <UserRound
                                        size={16}
                                        className="mb-1.5 text-[#2E46BA]"
                                    />
                                    <span className="block text-xs font-semibold text-[#2E46BA]">
                                        Find work
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-gray-500">
                                        Apply and track roles
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("employer")}
                                    className={`rounded-xl px-3 py-3 text-left transition ${role === "employer"
                                            ? "bg-[#eef0ff] ring-2 ring-[#2E46BA]"
                                            : "bg-[#f7f5ff] hover:bg-indigo-50"
                                        }`}
                                >
                                    <BriefcaseBusiness
                                        size={16}
                                        className="mb-1.5 text-[#2E46BA]"
                                    />
                                    <span className="block text-xs font-semibold text-[#2E46BA]">
                                        Hire people
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-gray-500">
                                        Post jobs and review
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-900"
                            >
                                Full name
                            </label>
                            <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                <UserRound
                                    size={16}
                                    strokeWidth={2.2}
                                    className="mr-3 shrink-0 text-[#484855]"
                                />
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-900"
                            >
                                Email
                            </label>
                            <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                <Mail
                                    size={16}
                                    strokeWidth={2.2}
                                    className="mr-3 shrink-0 text-[#484855]"
                                />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                />
                            </div>
                        </div>

                        {role === "employer" ? (
                            <>
                                <div>
                                    <label
                                        htmlFor="companyName"
                                        className="mb-2 block text-sm font-medium text-gray-900"
                                    >
                                        Company name
                                    </label>
                                    <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                        <Building2
                                            size={16}
                                            strokeWidth={2.2}
                                            className="mr-3 shrink-0 text-[#484855]"
                                        />
                                        <input
                                            id="companyName"
                                            type="text"
                                            placeholder="Acme Studio"
                                            value={companyName}
                                            onChange={(event) =>
                                                setCompanyName(event.target.value)
                                            }
                                            required
                                            className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="companyWebsite"
                                        className="mb-2 block text-sm font-medium text-gray-900"
                                    >
                                        Company website
                                    </label>
                                    <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                        <Globe
                                            size={16}
                                            strokeWidth={2.2}
                                            className="mr-3 shrink-0 text-[#484855]"
                                        />
                                        <input
                                            id="companyWebsite"
                                            type="text"
                                            inputMode="url"
                                            placeholder="yourcompany.com"
                                            value={companyWebsite}
                                            onChange={(event) =>
                                                setCompanyWebsite(event.target.value)
                                            }
                                            required
                                            className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : null}

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-900"
                            >
                                Password
                            </label>
                            <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                <Lock
                                    size={16}
                                    strokeWidth={2.2}
                                    className="mr-3 shrink-0 text-[#484855]"
                                />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    minLength={8}
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((visible) => !visible)
                                    }
                                    className="ml-2 shrink-0 text-[#484855] transition hover:text-gray-950"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-gray-900"
                            >
                                Confirm password
                            </label>
                            <div className="flex h-12 items-center rounded-xl bg-[#fbf9ff] px-4 ring-1 ring-[#dcd8ea] focus-within:ring-2 focus-within:ring-[#2E46BA]">
                                <Lock
                                    size={16}
                                    strokeWidth={2.2}
                                    className="mr-3 shrink-0 text-[#484855]"
                                />
                                <input
                                    id="confirmPassword"
                                    type={showConfPass ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    minLength={8}
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfPass((visible) => !visible)
                                    }
                                    className="ml-2 shrink-0 text-[#484855] transition hover:text-gray-950"
                                    aria-label={
                                        showConfPass
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfPass ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <p
                                role="alert"
                                className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                            >
                                {error}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-xl bg-[#1739ad] text-sm font-semibold text-white transition hover:bg-[#12329c] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting
                                ? "Creating your account..."
                                : role === "employer"
                                    ? "Create employer account"
                                    : "Create seeker account"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already on Hirelane?{" "}
                        <Link prefetch={false}
                            href="/login"
                            className="font-medium text-[#2E46BA] transition hover:text-[#12329c]"
                        >
                            Sign in
                        </Link>
                    </p>
                    <p className="mt-3 text-center text-sm text-gray-500">
                        Just browsing?{" "}
                        <Link prefetch={false}
                            href="/jobs"
                            className="font-medium text-[#2E46BA] transition hover:text-[#12329c]"
                        >
                            Find jobs
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
