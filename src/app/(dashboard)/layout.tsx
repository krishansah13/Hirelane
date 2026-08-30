import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isUserActive } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!(await isUserActive(session.user.id))) {
    redirect("/account-suspended");
  }

  return (
    <main className="relative isolate min-w-0 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[#f7f5ff]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#2E46BA]/10 blur-3xl" />

      <div className="relative mx-auto max-w-full px-4 py-4 sm:px-8 sm:py-10">
        {children}
      </div>
    </main>
  );
}
