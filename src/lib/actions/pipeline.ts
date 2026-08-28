"use server"

import { auth } from "@/auth";
import { updateStageSchema } from "../validation";
import { connectToDatabase } from "../utils/db";
import Application from "../models/Application";
import Job from "../models/Job";
import { canTransition } from "../stage-transitions";
import { revalidatePath } from "next/cache";
import { sendStageChangeEmail } from "../email";
import User from "../models/User";
import { isUserActive } from "../session";

export type PipelineActionState={
    ok: boolean;
    error?:string;
}

export async function updateApplicationStage(_prev: PipelineActionState, formData: FormData) : Promise<PipelineActionState>{
    const session = await auth();
    if(!session?.user) {
        return {
            ok:false,
            error: "You must be signed in"
        }
    }
    if(session.user.role!=="employer" || !session.user.companyId) {
        return {
            ok : false,
            error : "Only employers can update stages"
        }
    }
    if(!(await isUserActive(session.user.id))) {
        return {
            ok: false,
            error: "This account has been suspended"
        }
    }
    const parsed=updateStageSchema.safeParse({
        applicationId : formData.get("applicationId"),
        stage : formData.get("stage")
    });
    if(!parsed.success) {
        return {
            ok:false,
            error:"Invalid stage change"
        }
    }
    try {
        await connectToDatabase();

        const application = await Application.findById(parsed.data.applicationId)
        if(!application) {
            return {
                ok: false,
                error:"Application not found"
            }
        }
        const job = await Job.findOne({
            _id : application.jobId,
            companyId : session.user.companyId
        }).select("_id title");

        if(!job) return {
            ok: false,
            error : "Application not found!"
        }

        if(!canTransition(application.stage, parsed.data.stage)) {
            return {
                ok : false,
                error : `Cannot move from ${application.stage} to ${parsed.data.stage}`
            }
        }

        const now = new Date();
        application.stage = parsed.data.stage;
        application.stageChangedAt = now;
        application.stageHistory.push({
            stage : parsed.data.stage,
            changedAt : now
        });
        await application.save();
        revalidatePath(`/employer/jobs/${job._id}/applicants`);
        const seeker = await User.findById(application.userId).select("name email");
        if(seeker?.email) {
            await sendStageChangeEmail({
                to : seeker.email, 
                applicantName : seeker.name??"",
                jobTitle : job.title,
                stage:parsed.data.stage,
            });
        }
        return {ok:true}
    } catch(error){
        console.error("Update Stage Failed :", error)
        return {
            ok : false,
            error : "Couldn't update stage"
        }
    }
}