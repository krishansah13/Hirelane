export type UserRole = "seeker" | "employer" | "admin";
export type AccountStatus = "active" | "suspended" | "pending";

export function getHomePath(role?: UserRole | string | null): string {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer";
  return "/dashboard";
}

export function getRoleLabel(role?: UserRole | string | null): string {
  if (role === "admin") return "ADMIN";
  if (role === "employer") return "EMPLOYER";
  return "SEEKER";
}

export function formatRoleName(role?: UserRole | string | null): string {
  if (role === "admin") return "Admin";
  if (role === "employer") return "Employer";
  return "Seeker";
}

export function formatAccountStatus(status?: AccountStatus | string | null): AccountStatus {
  if (status === "suspended") return "suspended";
  if (status === "pending") return "pending";
  return "active";
}
