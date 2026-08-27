"use server";

import { auth } from "@/auth";

import { jobIdSchema, jobWriteSchema } from "../validation";

import { connectToDatabase } from "../utils/db";

import Job from "../models/Job";

import { slugifyJobTitle } from "../utils/slug";

import { revalidateJobBoard } from "../cache";

export type JobActionState = {
    ok: boolean;
    error?: string;
    jobId?: string;
};

function firstIssueMessage(error: {
    issues: { path: PropertyKey[]; message: string }[];
}) {
    const issue = error.issues[0];

    if (!issue) return "Invalid form data";

    const field = issue.path.map(String).join(".");

    return field ? `${field}: ${issue.message}` : issue.message;
}

function formfields(formData: FormData) {
    return {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        type: formData.get("type"),
        isRemote: formData.get("isRemote"),
        salaryMin: formData.get("salaryMin"),
        salaryMax: formData.get("salaryMax"),

        // Optional joining date
        joiningDate: formData.get("joiningDate"),

        expiresAt: formData.get("expiresAt"),
        publish: formData.get("publish") || "false",
    };
}

async function requireEmployerSession() {
    const session = await auth();

    if (!session?.user) {
        return {
            error: "You must be signed in" as const,
        };
    }

    if (session.user.role !== "employer" || !session.user.companyId) {
        return {
            error: "Only employer can manage jobs" as const,
        };
    }

    return {
        userId: session.user.id,
        companyId: session.user.companyId,
    };
}

export async function createJob(
    _prev: JobActionState,
    formData: FormData,
): Promise<JobActionState> {
    const session = await requireEmployerSession();

    if ("error" in session) {
        return {
            ok: false,
            error: session.error,
        };
    }

    const parsed = jobWriteSchema.safeParse(formfields(formData));

    if (!parsed.success) {
        return {
            ok: false,
            error: firstIssueMessage(parsed.error),
        };
    }

    const data = parsed.data;

    const shouldPublish = data.publish === "true";

    const now = new Date();

    const expiresAt = new Date(data.expiresAt);

    // Convert optional joining date.
    // Empty input becomes null instead of Invalid Date.
    const joiningDate = data.joiningDate
    ? new Date(data.joiningDate)
    : null;

if (shouldPublish && expiresAt.getTime() <= now.getTime()) {
    return {
        ok: false,
        error: "Expiry date must be in the future to publish",
    };
}

if (joiningDate && joiningDate.getTime() <= now.getTime()) {
    return {
        ok: false,
        error: "joiningDate: Joining date must be in the future",
    };
}

    try {
        await connectToDatabase();

        const job = await Job.create({
            companyId: session.companyId,
            postedById: session.userId,

            title: data.title,

            slug: slugifyJobTitle(data.title),

            description: data.description,

            location: data.location,

            type: data.type,

            isRemote: data.isRemote === "true",

            salaryMin: data.salaryMin,

            salaryMax: data.salaryMax,

            joiningDate,

            expiresAt,

            status: shouldPublish ? "published" : "draft",

            publishedAt: shouldPublish ? now : null,
        });

        if (shouldPublish) {
            revalidateJobBoard(job.slug);
        }

        return {
            ok: true,
            jobId: job._id.toString(),
        };
    } catch (error) {
        console.error("Create job failed", error);

        return {
            ok: false,
            error: "Could not create job",
        };
    }
}

export async function updateJob(
    _prev: JobActionState,
    formData: FormData,
): Promise<JobActionState> {
    const session = await requireEmployerSession();

    if ("error" in session) {
        return {
            ok: false,
            error: session.error,
        };
    }

    const idParsed = jobIdSchema.safeParse({
        jobId: formData.get("jobId"),
    });

    if (!idParsed.success) {
        return {
            ok: false,
            error: "Invalid job id",
        };
    }

    const parsed = jobWriteSchema.safeParse(formfields(formData));

    if (!parsed.success) {
        return {
            ok: false,
            error: firstIssueMessage(parsed.error),
        };
    }

    const data = parsed.data;

    const shouldPublish = data.publish === "true";

    const now = new Date();

    try {
        await connectToDatabase();

        const existing = await Job.findOne({
            _id: idParsed.data.jobId,
            companyId: session.companyId,
        });

        if (!existing) {
            return {
                ok: false,
                error: "Job not found",
            };
        }

        const expiresAt = new Date(data.expiresAt);

        const joiningDate = data.joiningDate
            ? new Date(data.joiningDate)
            : null;

        const pastExpiry = expiresAt.getTime() <= now.getTime();

        const nextStatus =
            pastExpiry &&
                (
                    shouldPublish ||
                    existing.status === "published" ||
                    existing.status === "expired"
                )
                ? "expired"
                : shouldPublish || existing.status === "published"
                    ? "published"
                    : existing.status === "expired"
                        ? "expired"
                        : "draft";

        existing.title = data.title;

        existing.description = data.description;

        existing.location = data.location;

        existing.type = data.type;

        existing.isRemote = data.isRemote === "true";

        existing.salaryMin = data.salaryMin;

        existing.salaryMax = data.salaryMax;

        existing.joiningDate = joiningDate;

        existing.expiresAt = expiresAt;

        existing.status = nextStatus;

        if (nextStatus === "published" && !existing.publishedAt) {
            existing.publishedAt = now;
        }

        await existing.save();

        if (nextStatus === "published") {
            revalidateJobBoard(existing.slug);
        }

        return {
            ok: true,
            jobId: existing._id.toString(),
        };
    } catch (error) {
        console.error("Update job failed", error);

        return {
            ok: false,
            error: "Could not update job",
        };
    }
}

export async function publishJob(
    _prev: JobActionState,
    formData: FormData,
): Promise<JobActionState> {
    const session = await requireEmployerSession();

    if ("error" in session) {
        return {
            ok: false,
            error: session.error,
        };
    }

    const idParsed = jobIdSchema.safeParse({
        jobId: formData.get("jobId"),
    });

    if (!idParsed.success) {
        return {
            ok: false,
            error: "Invalid job id",
        };
    }

    try {
        await connectToDatabase();

        const job = await Job.findOne({
            _id: idParsed.data.jobId,
            companyId: session.companyId,
        });

        if (!job) {
            return {
                ok: false,
                error: "Job not found",
            };
        }

        if (
            job.status === "expired" ||
            (job.expiresAt &&
                new Date(job.expiresAt).getTime() <= Date.now())
        ) {
            return {
                ok: false,
                error: "Expired jobs cannot be published",
            };
        }

        job.status = "published";

        if (!job.publishedAt) {
            job.publishedAt = new Date();
        }

        await job.save();

        revalidateJobBoard(job.slug);

        return {
            ok: true,
            jobId: job._id.toString(),
        };
    } catch (error) {
        console.error("Publish job failed", error);

        return {
            ok: false,
            error: "Could not publish job",
        };
    }
}