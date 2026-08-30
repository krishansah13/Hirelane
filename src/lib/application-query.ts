
import Application from "./models/Application";
import Company from "./models/Company";
import Job from "./models/Job";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { objectIdSchema } from "./validation";

const JOB_SELECT = "title slug location type isRemote companyId"
const COMPANY_SELECT = "name logoURL slug"

export async function getMyApplications(userId: string) {
    await connectToDatabase();
    void Job;
    void Company;

    const applications = await Application.find({ userId })
        .populate({
            path: "jobId",
            select: JOB_SELECT,
            populate: {
                path: "companyId",
                select: COMPANY_SELECT
            },
        })
        .sort({ appliedAt: -1 })
        .lean();

    return serialize(applications);
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