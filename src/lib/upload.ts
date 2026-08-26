import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export async function uploadResumePdf(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const publicId = filename.replace(/\.pdf$/i, "").replace(/\s+/g, "-");

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "hirelane/resumes",
          resource_type: "raw",
          format: "pdf",
          public_id: `${publicId}-${Date.now()}`,
        },
        (error, uploaded) => {
          if (error || !uploaded?.secure_url) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({ secure_url: uploaded.secure_url });
        },
      );

      stream.end(buffer);
    },
  );

  return result.secure_url;
}

export async function uploadProfileImage(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const format = ["jpg", "jpeg", "png", "webp"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "hirelane/avatars",
          resource_type: "image",
          format,
          public_id: `avatar-${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "auto" },
          ],
        },
        (error, uploaded) => {
          if (error || !uploaded?.secure_url) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({ secure_url: uploaded.secure_url });
        },
      );

      stream.end(buffer);
    },
  );

  return result.secure_url;
}
