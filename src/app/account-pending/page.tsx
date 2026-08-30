"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function AccountPendingPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/login?error=pending" });
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f7f5ff] px-6 py-16">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ACCOUNT
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Waiting for approval
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Your employer account is not active yet. An admin will review it, and
          you&apos;ll get an email when you can sign in.
        </p>
      </div>
    </main>
  );
}
