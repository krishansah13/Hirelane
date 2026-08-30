"use server";

import bcrypt from "bcryptjs";
import { signupSchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import User from "../models/User";
import Company from "../models/Company";

export type SignupState = {
  ok: boolean;
  error?: string;
  pendingApproval?: boolean;
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

function websiteKey(value: string) {
  try {
    const url = new URL(normalizeWebsite(value));
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    return `${host}${path}`;
  } catch {
    return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

      const companyName = (data.companyName ?? "").trim();
      const listed = await Company.find({
        name: { $regex: `^${escapeRegex(companyName)}$`, $options: "i" },
      }).select("_id name website");

      if (listed.length === 0) {
        return {
          ok: false,
          error:
            "This company is not listed on Hirelane yet. Ask an admin to add it before you sign up.",
        };
      }

      const company = listed.find(
        (entry) => websiteKey(entry.website) === websiteKey(website),
      );

      if (!company) {
        return {
          ok: false,
          error:
            "This company name and website do not match a listed company.",
        };
      }

      await User.create({
        name: data.name,
        email,
        passwordHash,
        role: "employer",
        status: "pending",
        companyId: company._id,
      });

      return { ok: true, pendingApproval: true };
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
