"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/utils/db";
import { isUserActive } from "@/lib/session";
import { setUserStatusSchema } from "@/lib/validation";

export type AdminUserActionState = {
  ok: boolean;
  error?: string;
};

export async function setUserAccountStatus(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { ok: false, error: "Only admins can manage users" };
  }

  if (!(await isUserActive(session.user.id))) {
    return { ok: false, error: "This account has been suspended" };
  }

  const parsed = setUserStatusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid account update" };
  }

  if (parsed.data.userId === session.user.id) {
    return { ok: false, error: "You cannot change your own account status" };
  }

  try {
    await connectToDatabase();

    const user = await User.findById(parsed.data.userId).select("role status");

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    if (user.role === "admin") {
      return { ok: false, error: "Admin accounts cannot be suspended" };
    }

    user.status = parsed.data.status;
    await user.save();

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return { ok: true };
  } catch (error) {
    console.error("Failed to update user status", error);
    return { ok: false, error: "Could not update this account. Try again." };
  }
}
