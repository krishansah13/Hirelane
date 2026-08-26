import { auth } from "@/auth";
import { uploadProfileImage, uploadResumePdf } from "@/lib/upload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid Form Data" }, { status: 400 });
  }

  const kind = String(formData.get("kind") ?? "resume");
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty File" }, { status: 400 });
  }

  if (kind === "avatar") {
    const isImage =
      IMAGE_TYPES.has(file.type) ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isImage) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, or WebP image" },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image too large (max 2MB)" },
        { status: 400 },
      );
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadProfileImage(buffer, file.name);
      return NextResponse.json({ url });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  if (session.user.role !== "seeker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isPdfMime = file.type === "application/pdf";
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfName) {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_RESUME_BYTES) {
    return NextResponse.json(
      { error: "File too large(max 5MB)" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadResumePdf(buffer, file.name);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
