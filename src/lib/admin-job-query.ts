import mongoose from "mongoose";
import Job from "./models/Job";
import Company from "./models/Company";
import Application from "./models/Application";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { expireOverduePublishedJobs } from "./job-query";
import { effectiveJobStatus } from "./job-status";
import { objectIdSchema, type AdminJobQueryInput } from "./validation";

const PAGE_SIZE = 12;

export type AdminJobQuery = {
  q?: string;
  status?: "draft" | "published" | "expired";
  type?: "part-time" | "contract" | "full-time" | "internship";
  remote?: "true" | "false" | "any";
  page?: number;
};

export type AdminJobListItem = {
  _id: string;
  title: string;
  slug?: string;
  location: string;
  type: string;
  isRemote: boolean;
  status: string;
  companyName: string | null;
  applicationCount: number;
  createdAt?: string;
};

export type AdminJobStats = {
  total: number;
  published: number;
  draft: number;
  expired: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toAdminJobQuery(input: AdminJobQueryInput): AdminJobQuery {
  return {
    q: input.q,
    status: input.status,
    type: input.type,
    remote: input.remote,
    page: input.page,
  };
}

export function buildAdminJobsHref(
  params: AdminJobQuery,
  page = params.page ?? 1,
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  if (params.remote && params.remote !== "any") search.set("remote", params.remote);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/jobs?${query}` : "/admin/jobs";
}

async function buildJobFilter(query: AdminJobQuery) {
  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.remote === "true") {
    filter.isRemote = true;
  } else if (query.remote === "false") {
    filter.isRemote = false;
  }

  if (query.q) {
    const pattern = escapeRegex(query.q.trim());
    const matchingCompanies = await Company.find({
      name: { $regex: pattern, $options: "i" },
    }).select("_id");

    filter.$or = [
      { title: { $regex: pattern, $options: "i" } },
      { companyId: { $in: matchingCompanies.map((company) => company._id) } },
    ];
  }

  return filter;
}

async function applicationCounts(jobIds: mongoose.Types.ObjectId[]) {
  if (jobIds.length === 0) return new Map<string, number>();

  const rows = await Application.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function getAdminJobStats(): Promise<AdminJobStats> {
  await expireOverduePublishedJobs();
  await connectToDatabase();

  const [total, published, draft, expired] = await Promise.all([
    Job.countDocuments({}),
    Job.countDocuments({ status: "published" }),
    Job.countDocuments({ status: "draft" }),
    Job.countDocuments({ status: "expired" }),
  ]);

  return { total, published, draft, expired };
}

export async function getAdminJobs(query: AdminJobQuery) {
  await expireOverduePublishedJobs();
  await connectToDatabase();

  const page = query.page && query.page > 0 ? query.page : 1;
  const filter = await buildJobFilter(query);

  const [total, rows] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .select("title slug location type isRemote status companyId createdAt expiresAt")
      .populate({ path: "companyId", select: "name" })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  const jobs = serialize(rows);
  const counts = await applicationCounts(
    jobs.map((job) => new mongoose.Types.ObjectId(String(job._id))),
  );

  const items: AdminJobListItem[] = jobs.map((job) => {
    const company =
      job.companyId && typeof job.companyId === "object" ? job.companyId : null;

    return {
      _id: String(job._id),
      title: job.title ?? "",
      slug: job.slug,
      location: job.location ?? "",
      type: job.type ?? "",
      isRemote: Boolean(job.isRemote),
      status: effectiveJobStatus(job),
      companyName: company?.name ?? null,
      applicationCount: counts.get(String(job._id)) ?? 0,
      createdAt: job.createdAt ? String(job.createdAt) : undefined,
    };
  });

  return {
    jobs: items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminJobById(jobId: string) {
  const parsed = objectIdSchema.safeParse(jobId);
  if (!parsed.success) return null;

  await expireOverduePublishedJobs();
  await connectToDatabase();

  const job = await Job.findById(parsed.data)
    .populate({ path: "companyId", select: "name slug logoURL website about" })
    .populate({ path: "postedById", select: "name email" })
    .lean();

  if (!job) return null;

  const applicationCount = await Application.countDocuments({ jobId: job._id });

  return {
    job: serialize(job),
    applicationCount,
    status: effectiveJobStatus(job),
  };
}
