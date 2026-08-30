import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
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
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f5ff] lg:flex-row">
      {/* <DashboardSidebar
        role={session.user.role}
        name={session.user.name ?? "Account"}
        image={session.user.image}
      /> */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}
