import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  formatAccountStatus,
  getHomePath,
  type AccountStatus,
} from "@/lib/roles";
import { connectToDatabase } from "@/lib/utils/db";
import User from "@/lib/models/User";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function getAccountStatus(
  userId: string,
): Promise<AccountStatus | null> {
  await connectToDatabase();
  const record = await User.findById(userId).select("status").lean();
  if (!record) return null;
  return formatAccountStatus(record.status);
}

export async function isUserActive(userId: string) {
  return (await getAccountStatus(userId)) === "active";
}

function redirectIfInactive(status: AccountStatus | null) {
  if (status === "pending") {
    redirect("/account-pending");
  }
  if (status !== "active") {
    redirect("/account-suspended");
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  redirectIfInactive(await getAccountStatus(user.id));
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
