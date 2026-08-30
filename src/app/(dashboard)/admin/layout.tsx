import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getHomePath } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect(getHomePath(session.user.role));
  }

  return <>
    {children}
      </>;
}
