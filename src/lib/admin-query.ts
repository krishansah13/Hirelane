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
  companyId: string | null;
  companyName: string | null;
  createdAt?: string;
};

export type AdminEmployerListItem = {
  _id: string;
  name: string;
  email: string;
  status: AccountStatus;
  companyId: string | null;
  companyName: string | null;
};

const EMPLOYER_PAGE_SIZE = 8;

export type AdminUserStats = {
  total: number;
  seekers: number;
  employers: number;
  admins: number;
  pending: number;
  suspended: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function statusFilter(status?: AccountStatus) {
  if (status === "suspended") return { status: "suspended" };
  if (status === "pending") return { status: "pending" };
  if (status === "active") return { status: "active" };
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

function companyRef(companyId?: { _id?: unknown; name?: string } | string | null) {
  if (companyId && typeof companyId === "object") {
    return {
      id: companyId._id ? String(companyId._id) : null,
      name: companyId.name ?? null,
    };
  }
  if (typeof companyId === "string") {
    return { id: companyId, name: null };
  }
  return { id: null, name: null };
}

function mapUser(user: {
  _id: unknown;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  companyId?: { _id?: unknown; name?: string } | string | null;
  createdAt?: string | Date;
}): AdminUserListItem {
  const company = companyRef(user.companyId);

  return {
    _id: String(user._id),
    name: user.name ?? "",
    email: user.email ?? "",
    role: (user.role as UserRole) ?? "seeker",
    status: formatAccountStatus(user.status),
    companyId: company.id,
    companyName: company.name,
    createdAt: user.createdAt ? String(user.createdAt) : undefined,
  };
}

export async function getAdminEmployers(query: {
  status: "pending" | "active";
  page?: number;
  companyId?: string;
  pageSize?: number;
}) {
  await connectToDatabase();

  const pageSize =
    query.pageSize && query.pageSize > 0 ? query.pageSize : EMPLOYER_PAGE_SIZE;
  const page = query.page && query.page > 0 ? query.page : 1;
  const filter: Record<string, unknown> = {
    role: "employer",
    status: query.status,
  };

  if (query.companyId) {
    filter.companyId = query.companyId;
  }

  const [total, rows] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("name email status companyId")
      .populate({ path: "companyId", select: "name" })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const employers: AdminEmployerListItem[] = serialize(rows).map((user) => {
    const company = companyRef(user.companyId);
    return {
      _id: String(user._id),
      name: user.name ?? "",
      email: user.email ?? "",
      status: formatAccountStatus(user.status),
      companyId: company.id,
      companyName: company.name,
    };
  });

  return {
    employers,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  await connectToDatabase();

  const [total, seekers, employers, admins, pending, suspended] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "seeker" }),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "pending" }),
      User.countDocuments({ status: "suspended" }),
    ]);

  return { total, seekers, employers, admins, pending, suspended };
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
