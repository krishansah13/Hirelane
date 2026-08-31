export function companyIdFromRef(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return id == null ? null : String(id);
  }

  return null;
}

export function canEmployerViewPublicJob(
  viewerCompanyId: string | null | undefined,
  jobCompanyId: unknown,
): boolean {
  const viewer = viewerCompanyId?.trim();
  const jobCompany = companyIdFromRef(jobCompanyId);
  return Boolean(viewer && jobCompany && viewer === jobCompany);
}
