import User from "./models/User";
import Application from "./models/Application";
import Job from "./models/Job";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { objectIdSchema } from "./validation";

export async function getCompanyJobs(companyId: string) {
    await connectToDatabase();
    const jobs = await Job.find({ companyId }).sort({ updatedAt: -1 }).lean();
    return serialize(jobs);
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