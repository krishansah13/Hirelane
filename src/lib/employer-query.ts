import mongoose from "mongoose";
import User from "./models/User";
import Application from "./models/Application";
import Job from "./models/Job";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { expireOverduePublishedJobs } from "./job-query";
import { effectiveJobStatus } from "./job-status";
import {
    objectIdSchema,
    type EmployerJobQueryInput,
} from "./validation";

const PAGE_SIZE = 10;

export type EmployerJobQuery = {
    q?: string;
    status?: "draft" | "published" | "expired";
    page?: number;
};

export type EmployerJobListItem = {
    _id: string;
    title: string;
    slug?: string;
    location: string;
    type: string;
    isRemote: boolean;
    status: string;
    salaryMin?: number;
    salaryMax?: number;
    updatedAt?: string;
    applicationCount: number;
};

export type EmployerJobStats = {
    live: number;
    draft: number;
    expired: number;
    total: number;
};

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toEmployerJobQuery(input: EmployerJobQueryInput): EmployerJobQuery {
    return {
        q: input.q,
        status: input.status,
        page: input.page,
    };
}

export function buildEmployerJobsHref(
    params: EmployerJobQuery,
    page = params.page ?? 1,
) {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return query ? `/employer?${query}` : "/employer";
}

async function applicationCounts(jobIds: mongoose.Types.ObjectId[]) {
    if (jobIds.length === 0) return new Map<string, number>();

    const rows = await Application.aggregate<{
        _id: mongoose.Types.ObjectId;
        count: number;
    }>([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function getCompanyJobStats(
    companyId: string,
): Promise<EmployerJobStats> {
    await expireOverduePublishedJobs();
    await connectToDatabase();

    const filter = { companyId };
    const [total, live, draft, expired] = await Promise.all([
        Job.countDocuments(filter),
        Job.countDocuments({ ...filter, status: "published" }),
        Job.countDocuments({ ...filter, status: "draft" }),
        Job.countDocuments({ ...filter, status: "expired" }),
    ]);

    return { total, live, draft, expired };
}

export async function getCompanyJobs(
    companyId: string,
    query: EmployerJobQuery = {},
) {
    await expireOverduePublishedJobs();
    await connectToDatabase();

    const page = query.page && query.page > 0 ? query.page : 1;
    const filter: Record<string, unknown> = { companyId };

    if (query.status) {
        filter.status = query.status;
    }

    if (query.q) {
        const pattern = escapeRegex(query.q.trim());
        filter.$or = [
            { title: { $regex: pattern, $options: "i" } },
            { location: { $regex: pattern, $options: "i" } },
        ];
    }

    const [total, rows] = await Promise.all([
        Job.countDocuments(filter),
        Job.find(filter)
            .select(
                "title slug location type isRemote status salaryMin salaryMax updatedAt expiresAt",
            )
            .sort({ updatedAt: -1, _id: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
    ]);

    const jobs = serialize(rows);
    const counts = await applicationCounts(
        jobs.map((job) => new mongoose.Types.ObjectId(String(job._id))),
    );

    const items: EmployerJobListItem[] = jobs.map((job) => ({
        _id: String(job._id),
        title: job.title ?? "",
        slug: job.slug,
        location: job.location ?? "",
        type: job.type ?? "",
        isRemote: Boolean(job.isRemote),
        status: effectiveJobStatus(job),
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        updatedAt: job.updatedAt ? String(job.updatedAt) : undefined,
        applicationCount: counts.get(String(job._id)) ?? 0,
    }));

    return {
        jobs: items,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
}

export async function getCompanyJobById(companyId: string, jobId: string) {
    const idParsed = objectIdSchema.safeParse(jobId);

    if (!idParsed.success) return null;
    
    await connectToDatabase();
    
    const job = await Job.findOne({ _id: idParsed.data, companyId }).lean();
    return serialize(job);
}

const USER_SELECT = "name email image mobile";
export async function getJobApplicants(companyId: string, jobId : string) {
    const job = await getCompanyJobById(companyId, jobId);
    if(!job) {
        return null;
    }

    await connectToDatabase();

    void User;

    const applications = await Application.find({jobId: job._id})
        .populate({path:"userId", select: USER_SELECT})
        .sort({appliedAt : -1})
        .lean()
    return {
        job, applications: serialize(applications)
    }
}