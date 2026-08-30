"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import User from "@/lib/models/User";
import Company from "@/lib/models/Company";
import { connectToDatabase } from "@/lib/utils/db";
import { isUserActive } from "@/lib/session";
import { sendEmployerApprovedEmail } from "@/lib/email";
import {
  createAdminEmployerSchema,
  objectIdSchema,
  setUserStatusSchema,
} from "@/lib/validation";

export type AdminEmployerFormValues = {
  name: string;
  email: string;
  password: string;
};

export type AdminUserActionState = {
  ok: boolean;
  error?: string;
  values?: AdminEmployerFormValues;
};

function employerFormValues(formData: FormData): AdminEmployerFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function createAdminEmployer(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const values = employerFormValues(formData);

  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { ok: false, error: "Only admins can add employers", values };
  }

  if (!(await isUserActive(session.user.id))) {
    return { ok: false, error: "This account has been suspended", values };
  }

  const parsed = createAdminEmployerSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid employer",
      values,
    };
  }

  try {
    await connectToDatabase();

    const company = await Company.findById(parsed.data.companyId).select("_id");
    if (!company) {
      return { ok: false, error: "Company not found", values };
    }

    const existing = await User.findOne({ email: parsed.data.email }).select("_id");
    if (existing) {
      return {
        ok: false,
        error: "An account with this email already exists",
        values,
      };
    }

    await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "employer",
      status: "active",
      companyId: company._id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${company._id}`);

    return { ok: true };
  } catch (error) {
    console.error("Failed to create employer", error);
    return {
      ok: false,
      error: "Could not add this employer. Try again.",
      values,
    };
  }
}

export async function deleteAdminEmployer(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { ok: false, error: "Only admins can remove employers" };
  }

  if (!(await isUserActive(session.user.id))) {
    return { ok: false, error: "This account has been suspended" };
  }

  const userId = objectIdSchema.safeParse(formData.get("userId"));
  const companyId = objectIdSchema.safeParse(formData.get("companyId"));

  if (!userId.success || !companyId.success) {
    return { ok: false, error: "Invalid employer" };
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({
      _id: userId.data,
      companyId: companyId.data,
      role: "employer",
    });

    if (!user) {
      return { ok: false, error: "Employer not found for this company" };
    }

    await user.deleteOne();

    revalidatePath("/admin");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/users");
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${companyId.data}`);

    return { ok: true };
  } catch (error) {
    console.error("Failed to delete employer", error);
    return { ok: false, error: "Could not remove this employer. Try again." };
  }
}

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

    const user = await User.findById(parsed.data.userId).select(
      "name email role status companyId",
    );

    if (!user) {
      return { ok: false, error: "User not found" };
    }

    if (user.role === "admin") {
      return { ok: false, error: "Admin accounts cannot be suspended" };
    }

    const wasPending = user.status === "pending";
    user.status = parsed.data.status;
    await user.save();

    if (
      wasPending &&
      parsed.data.status === "active" &&
      user.role === "employer"
    ) {
      const company = user.companyId
        ? await Company.findById(user.companyId).select("name")
        : null;

      await sendEmployerApprovedEmail({
        to: user.email,
        employerName: user.name,
        companyName: company?.name ?? "your company",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/users");
    revalidatePath("/admin/companies");
    if (user.companyId) {
      revalidatePath(`/admin/companies/${user.companyId}`);
    }

    return { ok: true };
  } catch (error) {
    console.error("Failed to update user status", error);
    return { ok: false, error: "Could not update this account. Try again." };
  }
}
