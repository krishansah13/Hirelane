import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getHomePath } from "@/lib/roles";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "employer") {
    redirect(getHomePath(session.user.role));
  }

  return <>{children}</>;
}
