export function publicJobFilter(now = new Date()) {
  return {
    status: "published" as const,
    expiresAt: { $gt: now },
  };
}

export function isLiveJob(job: {
  status?: string;
  expiresAt?: string | Date | null;
} | null) {
  if (!job || job.status !== "published" || !job.expiresAt) {
    return false;
  }

  return new Date(job.expiresAt).getTime() > Date.now();
}

export function effectiveJobStatus(job: {
  status?: string;
  expiresAt?: string | Date | null;
}) {
  if (
    job.status === "published" &&
    job.expiresAt &&
    new Date(job.expiresAt).getTime() <= Date.now()
  ) {
    return "expired";
  }

  return job.status ?? "draft";
}
