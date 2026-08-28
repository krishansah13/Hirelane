import { auth } from "@/auth";
import { uploadResumePdf } from "@/lib/upload";
import { isUserActive } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const MAX_BYTES = 5*1024*1024;

export async function POST(request : Request) {
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({
            error : "Unauthorized"
        }, {
            status : 401
        })
    }

    if(session.user.role !== "seeker") {
        return NextResponse.json({
            error : "Forbidden"
        }, {
            status : 403
        });
    }

    if(!(await isUserActive(session.user.id))) {
        return NextResponse.json({
            error : "This account has been suspended"
        }, {
            status : 403
        });
    }

    let formData : FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({
            error : "Invalid Form Data"
        }, {
            status : 400
        })
    }

    const file = formData.get("file");

    if(!file || !(file instanceof File)) {
        return NextResponse.json({
            error:  "PDF File is required"
        }, {
            status : 400
        })
    }

    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");

    if(!isPdfMime && !isPdfName) {
        return NextResponse.json({
            error:  "Only PDF files are allowed"
        }, {
            status : 400
        })
    }

    if(file.size <= 0) {
        return NextResponse.json({
            error : "Empty File"
        }, {
            status : 400
        })
    }

    if(file.size > MAX_BYTES) {
        return NextResponse.json({
            error : "File too large(max 5MB)"
        }, {
            status : 400
        })
    }

    try{
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadResumePdf(buffer, file.name);

        return NextResponse.json({url})
    } catch(error) {
        console.error("Upload failed:", error);
        return NextResponse.json({
            error : "Upload failed"
        }, {
            status : 500
        })
    }
}