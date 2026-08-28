import mongoose from "mongoose";
import Company from "./models/Company";
import Job from "./models/Job";
import User from "./models/User";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { objectIdSchema, type AdminCompanyQueryInput } from "./validation";

const PAGE_SIZE = 12;

export type AdminCompanyQuery = {
  q?: string;
  page?: number;
};

export type AdminCompanyListItem = {
  _id: string;
  name: string;
  slug: string;
  website: string;
  logoURL?: string;
  employerCount: number;
  jobCount: number;
  createdAt?: string;
};

export type AdminCompanyStats = {
  total: number;
  withJobs: number;
  withEmployers: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toAdminCompanyQuery(
  input: AdminCompanyQueryInput,
): AdminCompanyQuery {
  return {
    q: input.q,
    page: input.page,
  };
}

export function buildAdminCompaniesHref(
  params: AdminCompanyQuery,
  page = params.page ?? 1,
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/companies?${query}` : "/admin/companies";
}

async function relatedCounts(companyIds: mongoose.Types.ObjectId[]) {
  if (companyIds.length === 0) {
    return {
      employers: new Map<string, number>(),
      jobs: new Map<string, number>(),
    };
  }

  const [employerRows, jobRows] = await Promise.all([
    User.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
    ]),
    Job.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    employers: new Map(employerRows.map((row) => [String(row._id), row.count])),
    jobs: new Map(jobRows.map((row) => [String(row._id), row.count])),
  };
}

export async function getAdminCompanyStats(): Promise<AdminCompanyStats> {
  await connectToDatabase();

  const [total, withJobs, withEmployers] = await Promise.all([
    Company.countDocuments({}),
    Job.distinct("companyId").then((ids) => ids.length),
    User.distinct("companyId", { companyId: { $ne: null } }).then(
      (ids) => ids.length,
    ),
  ]);

  return { total, withJobs, withEmployers };
}

export async function getAdminCompanies(query: AdminCompanyQuery) {
  await connectToDatabase();

  const page = query.page && query.page > 0 ? query.page : 1;
  const filter: Record<string, unknown> = {};

  if (query.q) {
    const pattern = escapeRegex(query.q.trim());
    filter.$or = [
      { name: { $regex: pattern, $options: "i" } },
      { website: { $regex: pattern, $options: "i" } },
    ];
  }

  const [total, rows] = await Promise.all([
    Company.countDocuments(filter),
    Company.find(filter)
      .select("name slug website logoURL createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  const companies = serialize(rows);
  const counts = await relatedCounts(
    companies.map((company) => new mongoose.Types.ObjectId(String(company._id))),
  );

  const items: AdminCompanyListItem[] = companies.map((company) => ({
    _id: String(company._id),
    name: company.name ?? "",
    slug: company.slug ?? "",
    website: company.website ?? "",
    logoURL: company.logoURL,
    employerCount: counts.employers.get(String(company._id)) ?? 0,
    jobCount: counts.jobs.get(String(company._id)) ?? 0,
    createdAt: company.createdAt ? String(company.createdAt) : undefined,
  }));

  return {
    companies: items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminCompanyById(companyId: string) {
  const parsed = objectIdSchema.safeParse(companyId);
  if (!parsed.success) return null;

  await connectToDatabase();

  const company = await Company.findById(parsed.data).lean();
  if (!company) return null;

  const [employers, jobs, jobCount] = await Promise.all([
    User.find({ companyId: company._id })
      .select("name email role status createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    Job.find({ companyId: company._id })
      .select("title status location type createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Job.countDocuments({ companyId: company._id }),
  ]);

  return {
    company: serialize(company),
    employers: serialize(employers),
    jobs: serialize(jobs),
    employerCount: employers.length,
    jobCount,
  };
}
