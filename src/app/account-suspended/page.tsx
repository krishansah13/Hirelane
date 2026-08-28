"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function AccountSuspendedPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/login?error=suspended" });
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f7f5ff] px-6 py-16">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ACCOUNT
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          This account is suspended
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Signing you out. If you think this is a mistake, contact Hirelane
          support.
        </p>
      </div>
    </main>
  );
}
