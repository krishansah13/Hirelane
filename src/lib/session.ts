import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomePath } from "@/lib/roles";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireSeeker() {
  const user = await requireUser();
  if (user.role !== "seeker") {
    redirect(getHomePath(user.role));
  }
  return user;
}

export async function requireEmployer() {
  const user = await requireUser();
  if (user.role !== "employer" || !user.companyId) {
    redirect(getHomePath(user.role));
  }
  return user as typeof user & { companyId: string };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect(getHomePath(user.role));
  }
  return user;
}
