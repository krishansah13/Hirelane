"use client";

import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { getHomePath } from "@/lib/roles";

const demoAccounts = [
  {
    label: "Seeker",
    email: "seeker1@example.com",
    password: "Seeker@123",
  },
  {
    label: "Employer",
    email: "rahul@technova.com",
    password: "Employer@123",
  },
] as const;

function getSafeCallbackUrl(value: string | null) {
  if (!value) return null;
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login")
  ) {
    return null;
  }
  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "suspended"
      ? "This account has been suspended. Contact support if you need access."
      : searchParams.get("error") === "pending"
        ? "Your employer account is waiting for admin approval. You'll get an email when it's ready."
        : "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const code = `${result.code ?? ""} ${result.error}`.toLowerCase();
        setError(
          code.includes("account_suspended")
            ? "This account has been suspended. Contact support if you need access."
            : code.includes("account_pending")
              ? "Your employer account is waiting for admin approval. You'll get an email when it's ready."
              : "Invalid email or password.",
        );
        return;
      }

      if (!result?.ok) {
        setError("Invalid email or password");
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
              WELCOME BACK
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              Sign in to continue
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Access your dashboard and pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-full w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-[#a5a4ae]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="ml-2 shrink-0 text-[#484855] transition hover:text-gray-950"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#1739ad] text-sm font-semibold text-white transition hover:bg-[#12329c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <p className="mb-3 text-center text-xs font-medium text-gray-400">
              Try a demo account
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                  className="rounded-xl bg-[#f7f5ff] px-3 py-2.5 text-left transition hover:bg-indigo-50"
                >
                  <span className="block text-xs font-semibold text-[#2E46BA]">
                    {account.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-gray-500">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Just browsing?{" "}
            <Link
              href="/jobs"
              className="font-medium text-[#2E46BA] transition hover:text-[#12329c]"
            >
              Find jobs
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-gray-500">
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#2E46BA] transition hover:text-[#12329c]"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
