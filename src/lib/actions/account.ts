"use server";

import { auth } from "@/auth";
import { accountSchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import User from "../models/User";

export type AccountState = {
  ok: boolean;
  error?: string;
  name?: string;
  image?: string;
};

function firstIssueMessage(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const issue = error.issues[0];
  return issue?.message ?? "Invalid form data";
}

export async function updateAccount(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "You must be signed in" };
  }

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile") ?? "",
    image: formData.get("image") || "",
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  try {
    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { ok: false, error: "Account not found" };
    }

    user.name = parsed.data.name;
    user.mobile = parsed.data.mobile;
    if (parsed.data.image) {
      user.image = parsed.data.image;
    }

    await user.save();

    return {
      ok: true,
      name: user.name,
      image: user.image || "",
    };
  } catch (error) {
    console.error("Update account failed", error);
    return { ok: false, error: "Could not update your account" };
  }
}
