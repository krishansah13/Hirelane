import User from "./models/User";
import { connectToDatabase } from "./utils/db";
import { serialize } from "./utils/serialize";
import { formatAccountStatus, type AccountStatus, type UserRole } from "./roles";
import type { AdminUserQueryInput } from "./validation";

const PAGE_SIZE = 12;

export type AdminUserQuery = {
  q?: string;
  role?: UserRole;
  status?: AccountStatus;
  page?: number;
};

export type AdminUserListItem = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  companyName: string | null;
  createdAt?: string;
};

export type AdminUserStats = {
  total: number;
  seekers: number;
  employers: number;
  admins: number;
  suspended: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function statusFilter(status?: AccountStatus) {
  if (status === "suspended") return { status: "suspended" };
  if (status === "active") return { status: { $ne: "suspended" } };
  return {};
}

export function toAdminUserQuery(input: AdminUserQueryInput): AdminUserQuery {
  return {
    q: input.q,
    role: input.role,
    status: input.status,
    page: input.page,
  };
}

export function buildAdminUsersHref(params: AdminUserQuery, page = params.page ?? 1) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

function mapUser(user: {
  _id: unknown;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  companyId?: { name?: string } | string | null;
  createdAt?: string | Date;
}): AdminUserListItem {
  const company =
    user.companyId && typeof user.companyId === "object"
      ? user.companyId
      : null;

  return {
    _id: String(user._id),
    name: user.name ?? "",
    email: user.email ?? "",
    role: (user.role as UserRole) ?? "seeker",
    status: formatAccountStatus(user.status),
    companyName: company?.name ?? null,
    createdAt: user.createdAt ? String(user.createdAt) : undefined,
  };
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  await connectToDatabase();

  const [total, seekers, employers, admins, suspended] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "seeker" }),
    User.countDocuments({ role: "employer" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ status: "suspended" }),
  ]);

  return { total, seekers, employers, admins, suspended };
}

export async function getAdminUsers(query: AdminUserQuery) {
  await connectToDatabase();

  const page = query.page && query.page > 0 ? query.page : 1;
  const filter: Record<string, unknown> = {
    ...statusFilter(query.status),
  };

  if (query.role) {
    filter.role = query.role;
  }

  if (query.q) {
    const pattern = escapeRegex(query.q.trim());
    filter.$or = [
      { name: { $regex: pattern, $options: "i" } },
      { email: { $regex: pattern, $options: "i" } },
    ];
  }

  const [total, rows] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("name email role status companyId createdAt")
      .populate({ path: "companyId", select: "name" })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  const users = serialize(rows).map(mapUser);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
