"use server";

import bcrypt from "bcryptjs";
import { signupSchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import User from "../models/User";
import Company from "../models/Company";
import { slugifyCompanyName } from "../utils/slug";
import { revalidateJobBoard } from "../cache";

export type SignupState = {
  ok: boolean;
  error?: string;
};

function firstIssueMessage(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const issue = error.issues[0];
  if (!issue) return "Invalid form data";
  return issue.message;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function signup(formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    companyName: formData.get("companyName") || undefined,
    companyWebsite: formData.get("companyWebsite") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  try {
    await connectToDatabase();

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return {
        ok: false,
        error: "An account with this email already exists",
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    if (data.role === "employer") {
      const website = normalizeWebsite(data.companyWebsite ?? "");
      try {
        new URL(website);
      } catch {
        return { ok: false, error: "Enter a valid company website" };
      }

      const company = await Company.create({
        name: data.companyName,
        slug: slugifyCompanyName(data.companyName ?? "company"),
        website,
        logoURL: "",
        about: "",
      });

      try {
        await User.create({
          name: data.name,
          email,
          passwordHash,
          role: "employer",
          companyId: company._id,
        });
      } catch (error) {
        await Company.deleteOne({ _id: company._id });
        throw error;
      }

      revalidateJobBoard();
      return { ok: true };
    }

    await User.create({
      name: data.name,
      email,
      passwordHash,
      role: "seeker",
      companyId: null,
    });

    return { ok: true };
  } catch (error) {
    console.error("Signup failed", error);
    return { ok: false, error: "Could not create your account. Try again." };
  }
}
