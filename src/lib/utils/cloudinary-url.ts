export function cloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    const afterUpload = parts.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part));
    const idParts =
      versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (idParts.length === 0) return null;

    const last = idParts[idParts.length - 1];
    idParts[idParts.length - 1] = last.replace(/\.[^.]+$/, "");
    return idParts.join("/");
  } catch {
    return null;
  }
}
