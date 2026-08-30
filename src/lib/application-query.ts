
import mongoose from "mongoose";
import Application from "./models/Application";
import Company from "./models/Company";
import Job from "./models/Job";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import {
    objectIdSchema,
    type ApplicationStage,
    type SeekerApplicationQueryInput,
} from "./validation";

const PAGE_SIZE = 10;
const JOB_SELECT = "title slug location type isRemote companyId"
const COMPANY_SELECT = "name logoURL slug"

export type SeekerApplicationQuery = {
    q?: string;
    stage?: ApplicationStage;
    page?: number;
};

export type SeekerApplicationListItem = {
    _id: string;
    stage: string;
    appliedAt?: string;
    job: {
        title: string;
        location?: string;
        type?: string;
        isRemote?: boolean;
    } | null;
    company: {
        name: string;
        slug?: string;
        logoURL?: string;
    } | null;
};

export type SeekerApplicationStats = {
    total: number;
    active: number;
    interview: number;
    offer: number;
};

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toSeekerApplicationQuery(
    input: SeekerApplicationQueryInput,
): SeekerApplicationQuery {
    return {
        q: input.q,
        stage: input.stage,
        page: input.page,
    };
}

export function buildDashboardHref(
    params: SeekerApplicationQuery,
    page = params.page ?? 1,
) {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.stage) search.set("stage", params.stage);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
}

async function matchingJobIds(userId: string, q: string) {
    const pattern = escapeRegex(q.trim());
    const applications = await Application.find({ userId }).select("jobId").lean();
    const jobIds = applications
        .map((application) => application.jobId)
        .filter(Boolean);

    if (jobIds.length === 0) return [];

    const matchingCompanies = await Company.find({
        name: { $regex: pattern, $options: "i" },
    })
        .select("_id")
        .lean();

    const jobs = await Job.find({
        _id: { $in: jobIds },
        $or: [
            { title: { $regex: pattern, $options: "i" } },
            { location: { $regex: pattern, $options: "i" } },
            { companyId: { $in: matchingCompanies.map((company) => company._id) } },
        ],
    })
        .select("_id")
        .lean();

    return jobs.map((job) => job._id);
}

export async function getMyApplicationStats(
    userId: string,
): Promise<SeekerApplicationStats> {
    await connectToDatabase();

    const parsed = objectIdSchema.safeParse(userId);
    const match = parsed.success
        ? { userId: new mongoose.Types.ObjectId(parsed.data) }
        : { userId };

    const rows = await Application.aggregate<{ _id: string; count: number }>([
        { $match: match },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const byStage = new Map(rows.map((row) => [row._id, row.count]));
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const rejected = byStage.get("rejected") ?? 0;
    const offer = byStage.get("offer") ?? 0;

    return {
        total,
        active: total - rejected - offer,
        interview: byStage.get("interview") ?? 0,
        offer,
    };
}

export async function getMyApplications(
    userId: string,
    query: SeekerApplicationQuery = {},
) {
    await connectToDatabase();
    void Job;
    void Company;

    const page = query.page && query.page > 0 ? query.page : 1;
    const filter: Record<string, unknown> = { userId };

    if (query.stage) {
        filter.stage = query.stage;
    }

    if (query.q) {
        filter.jobId = { $in: await matchingJobIds(userId, query.q) };
    }

    const [total, rows] = await Promise.all([
        Application.countDocuments(filter),
        Application.find(filter)
            .populate({
                path: "jobId",
                select: JOB_SELECT,
                populate: {
                    path: "companyId",
                    select: COMPANY_SELECT,
                },
            })
            .sort({ appliedAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
    ]);

    const applications: SeekerApplicationListItem[] = serialize(rows).map(
        (application) => {
            const job =
                application.jobId && typeof application.jobId === "object"
                    ? application.jobId
                    : null;
            const company =
                job?.companyId && typeof job.companyId === "object"
                    ? job.companyId
                    : null;

            return {
                _id: String(application._id),
                stage: application.stage ?? "applied",
                appliedAt: application.appliedAt
                    ? String(application.appliedAt)
                    : undefined,
                job: job
                    ? {
                          title: job.title ?? "Role unavailable",
                          location: job.location,
                          type: job.type,
                          isRemote: job.isRemote,
                      }
                    : null,
                company: company
                    ? {
                          name: company.name ?? "Company",
                          slug: company.slug,
                          logoURL: company.logoURL,
                      }
                    : null,
            };
        },
    );

    return {
        applications,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
}

export async function getMyApplicationById(userId: string, applicationId: string) {
    const idParsed = objectIdSchema.safeParse(applicationId);
    if (!idParsed.success) return null;
    await connectToDatabase();
    void Job;
    void Company;

    const application = await Application.findOne({
        _id: idParsed.data,
        userId,
    }).populate({
        path: "jobId",
        select: JOB_SELECT,
        populate: {
            path: "companyId",
            select: COMPANY_SELECT
        },
    }).lean();

    return serialize(application);
}

export async function getMyApplicationStageHistory(userId: string, applicationId: string) {
    const idParsed = objectIdSchema.safeParse(applicationId);
    if (!idParsed.success) return null;
    await connectToDatabase();
    void Job;
    void Company;

    const application = await Application.findOne({
        _id: idParsed.data,
        userId,
    }).select("stageHistory stage").lean();

    if (!application) return null;

    return serialize({
        stage: application.stage,
        stageHistory: application.stageHistory ?? []
    });
}