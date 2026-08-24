"use server"

import { auth } from "@/auth";
import { jobIdSchema, jobWriteSchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import Job from "../models/Job";
import { slugifyJobTitle } from "../utils/slug";
import { revalidateJobBoard } from "../cache";

export type JobActionState = {
    ok: boolean;
    error?:string;
    jobId?:string;
};

function firstIssueMessage(error: { issues: { path: PropertyKey[]; message: string }[] }) {
    const issue = error.issues[0];
    if (!issue) return "Invalid form data";
    const field = issue.path.map(String).join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
}

function formfields(formData: FormData) {
    return {
        title : formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        type: formData.get("type"),
        isRemote:formData.get("isRemote"),
        salaryMin:formData.get("salaryMin"),
        salaryMax:formData.get("salaryMax"),
        expiresAt:formData.get("expiresAt"),
        publish:formData.get("publish") || "false",
    }
}

async function requireEmployerSession(){
    const session = await auth();
    if(!session?.user) {
        return {
            error : "You must be signed in" as const
        };
    }
    if(session.user.role!=="employer" || !session.user.companyId) {
        return {
            error : "Only employer can manage jobs" as const
        }
    }
    return {
        userId : session.user.id,
        companyId: session.user.companyId
    }
}

export async function createJob(_prev:JobActionState, formData: FormData): Promise<JobActionState> {
    const session = await requireEmployerSession();
    if("error" in session) {
        return {
            ok: false,
            error: session.error
        }
    }
    const parsed= jobWriteSchema.safeParse(formfields(formData));
    if(!parsed.success) {
        return {
            ok : false,
            error : firstIssueMessage(parsed.error),
        }
    }
    const data = parsed.data;
    const shouldPublish = data.publish === "true";
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);

    if (shouldPublish && expiresAt.getTime() <= now.getTime()) {
        return {
            ok: false,
            error: "Expiry date must be in the future to publish",
        };
    }

    try {
        await connectToDatabase();

        const job = await Job.create({
            companyId : session.companyId,
            postedById : session.userId,
            title : data.title,
            slug : slugifyJobTitle(data.title),
            description : data.description,
            location: data.location,
            type : data.type,
            isRemote : data.isRemote === "true",
            salaryMin : data.salaryMin,
            salaryMax : data.salaryMax,
            expiresAt,
            status: shouldPublish?"published":"draft",
            publishedAt : shouldPublish ? now : null,
        });
        if(shouldPublish) {
            revalidateJobBoard(job.slug);
        }
        return {
            ok : true,
            jobId : job._id.toString()
        };
    } catch(error) {
        console.error("Create job failed",error);
        return {
            ok: false,
            error : "Could not create job"
        };
    }
}

export async function updateJob(_prev:JobActionState, formData: FormData): Promise<JobActionState> {
    const session = await requireEmployerSession();
    if("error" in session) {
        return {
            ok: false, 
            error: session.error
        };
    }
    const idParsed = jobIdSchema.safeParse({
        jobId: formData.get("jobId")
    });
    if(!idParsed.success) {
        return {
            ok : false,
            error : "Invalid job id"
        };
    }
    const parsed = jobWriteSchema.safeParse(formfields(formData));
    if(!parsed.success){
        return {
            ok : false,
            error : firstIssueMessage(parsed.error),
        }
    }
    const data = parsed.data;
    const shouldPublish = data.publish === "true";
    const now = new Date();
    try {
        await connectToDatabase();

        const exisiting = await Job.findOne({
            _id : idParsed.data.jobId,
            companyId : session.companyId,
        });

        if(!exisiting) {
            return {
                ok : false,
                error : "Job Not Found"
            }
        }
        const expiresAt = new Date(data.expiresAt);
        const pastExpiry = expiresAt.getTime() <= now.getTime();
        const nextStatus = pastExpiry && (shouldPublish || exisiting.status === "published" || exisiting.status === "expired")
            ? "expired"
            : shouldPublish || exisiting.status === "published"
                ? "published"
                : exisiting.status === "expired"
                    ? "expired"
                    : "draft";

        exisiting.title = data.title;
        exisiting.description = data.description;
        exisiting.location = data.location;
        exisiting.type = data.type;
        exisiting.isRemote = data.isRemote === "true";
        exisiting.salaryMin = data.salaryMin;
        exisiting.salaryMax = data.salaryMax;
        exisiting.expiresAt = expiresAt;
        exisiting.status = nextStatus;
        if(nextStatus === "published" && !exisiting.publishedAt) {
            exisiting.publishedAt = now;
        }

        await exisiting.save();
        if(nextStatus === "published"){
            revalidateJobBoard(exisiting.slug);
        }
        return {
            ok: true,
            jobId : exisiting._id.toString()
        }
    } catch(error) {
        console.error("Update job failed",error);
        return {
            ok: false,
            error : "Could not update job"
        };
    }
}

export async function publishJob(_prev:JobActionState, formData : FormData): Promise<JobActionState> {
    const session = await requireEmployerSession();
    if("error" in session) {
        return {
            ok : false,
            error : session.error
        }
    }
    const idParsed = jobIdSchema.safeParse({
        jobId : formData.get("jobId")
    });
    if(!idParsed.success) {
        return {
            ok : false,
            error : "Invalid job id"
        }
    }
    
    try {
        await connectToDatabase();
        const job = await Job.findOne({
            _id : idParsed.data.jobId,
            companyId : session.companyId,
        });
        if(!job) {
            return {
                ok : false,
                error : "Job not found"
            };
        }
        if(job.status === "expired" || (job.expiresAt && new Date(job.expiresAt).getTime() <= Date.now())) {
            return {
                ok : false,
                error : "Expired jobs cannot be published"
            }
        }
        job.status = "published";
        if(!job.publishedAt) {
            job.publishedAt = new Date();
        }
        await job.save();
        revalidateJobBoard(job.slug);
        return {
            ok : true,
            jobId : job._id.toString()
        };
    } catch (error) {
        console.error("Publish job failed",error);
        return {
            ok : false,
            error : "Could not publish job"
        }
    }
}