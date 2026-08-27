export type UserRole = "seeker" | "employer" | "admin";

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
