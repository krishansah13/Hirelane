"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Company from "@/lib/models/Company";
import Job from "@/lib/models/Job";
import User from "@/lib/models/User";
import Application from "@/lib/models/Application";
import { connectToDatabase } from "@/lib/utils/db";
import { isUserActive } from "@/lib/session";
import {
  createAdminCompanySchema,
  objectIdSchema,
  updateAdminCompanySchema,
} from "@/lib/validation";
import { revalidateJobBoard } from "@/lib/cache";
import { slugifyCompanyName } from "@/lib/utils/slug";

export type AdminCompanyFormValues = {
  name: string;
  website: string;
  about: string;
};

export type AdminCompanyActionState = {
  ok: boolean;
  error?: string;
  values?: AdminCompanyFormValues;
};

function companyFormValues(formData: FormData): AdminCompanyFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    website: String(formData.get("website") ?? ""),
    about: String(formData.get("about") ?? ""),
  };
}

async function requireAdminActor() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Only admins can manage companies" as const };
  }

  if (!(await isUserActive(session.user.id))) {
    return { error: "This account has been suspended" as const };
  }

  return { userId: session.user.id };
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function createAdminCompany(
  _prev: AdminCompanyActionState,
  formData: FormData,
): Promise<AdminCompanyActionState> {
  const values = companyFormValues(formData);

  const actor = await requireAdminActor();
  if ("error" in actor) {
    return { ok: false, error: actor.error, values };
  }

  const parsed = createAdminCompanySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    about: formData.get("about") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid company",
      values,
    };
  }

  const website = normalizeWebsite(parsed.data.website);

  try {
    new URL(website);
  } catch {
    return { ok: false, error: "Enter a valid company website", values };
  }

  let companyId: string;

  try {
    await connectToDatabase();

    if (await Company.findOne({ name: parsed.data.name })) {
      return { ok: false, error: "Company already exists", values };
    }

    if (await Company.findOne({ website })) {
      return {
        ok: false,
        error: "Company with this website already exists",
        values,
      };
    }

    const company = await Company.create({
      name: parsed.data.name,
      slug: slugifyCompanyName(parsed.data.name),
      website,
      logoURL: "",
      about: parsed.data.about ?? "",
    });

    companyId = String(company._id);

    revalidateJobBoard();
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${companyId}`);
  } catch (error) {
    console.error("Failed to create company", error);
    return {
      ok: false,
      error: "Could not create this company. Try again.",
      values,
    };
  }

  redirect(`/admin/companies/${companyId}`);
}

export async function updateAdminCompany(
  _prev: AdminCompanyActionState,
  formData: FormData,
): Promise<AdminCompanyActionState> {
  const actor = await requireAdminActor();
  if ("error" in actor) {
    return { ok: false, error: actor.error };
  }

  const parsed = updateAdminCompanySchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    website: formData.get("website"),
    about: formData.get("about") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid company" };
  }

  const website = normalizeWebsite(parsed.data.website);

  try {
    new URL(website);
  } catch {
    return { ok: false, error: "Enter a valid company website" };
  }

  try {
    await connectToDatabase();

    const company = await Company.findById(parsed.data.companyId);
    if (!company) {
      return { ok: false, error: "Company not found" };
    }

    company.name = parsed.data.name;
    company.website = website;
    company.about = parsed.data.about ?? "";
    await company.save();

    revalidateJobBoard();
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${company._id}`);

    return { ok: true };
  } catch (error) {
    console.error("Failed to update company", error);
    return { ok: false, error: "Could not update this company. Try again." };
  }
}

export async function deleteAdminCompany(
  _prev: AdminCompanyActionState,
  formData: FormData,
): Promise<AdminCompanyActionState> {
  const actor = await requireAdminActor();
  if ("error" in actor) {
    return { ok: false, error: actor.error };
  }

  const parsed = objectIdSchema.safeParse(formData.get("companyId"));
  if (!parsed.success) {
    return { ok: false, error: "Invalid company" };
  }

  try {
    await connectToDatabase();

    const company = await Company.findById(parsed.data);
    if (!company) {
      return { ok: false, error: "Company not found" };
    }

    const jobs = await Job.find({ companyId: company._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ companyId: company._id });
    }

    await User.updateMany(
      { companyId: company._id },
      { $set: { companyId: null } },
    );
    await company.deleteOne();

    revalidateJobBoard();
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath("/admin/jobs");
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Failed to delete company", error);
    return { ok: false, error: "Could not remove this company. Try again." };
  }

  redirect("/admin/companies");
}
