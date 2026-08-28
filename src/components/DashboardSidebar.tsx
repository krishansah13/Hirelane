"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { getApplicationNavTitle } from "@/lib/actions/application-nav";
import { getRoleLabel, type UserRole } from "@/lib/roles";

type DashboardSidebarProps = {
  role: UserRole;
  name: string;
  image?: string | null;
};

const seekerLinks = [
  { href: "/dashboard", label: "Applications", icon: LayoutDashboard },
  { href: "/account", label: "Account", icon: CircleUserRound },
];

const employerLinks = [
  { href: "/employer", label: "Posted roles", icon: Briefcase },
  { href: "/employer/jobs/new", label: "Post a job", icon: PlusCircle },
  { href: "/account", label: "Account", icon: CircleUserRound },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
];

function getLinks(role: UserRole) {
  if (role === "admin") return adminLinks;
  if (role === "employer") return employerLinks;
  return seekerLinks;
}

export default function DashboardSidebar({
  role,
  name,
  image,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const links = getLinks(role);

  const applicationMatch = pathname.match(
    /^\/dashboard\/applications\/([^/]+)/,
  );
  const applicationId = applicationMatch?.[1] ?? null;

  const [jobTitle, setJobTitle] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTitle() {
      if (!applicationId || role !== "seeker") {
        setJobTitle(null);
        return;
      }

      const title = await getApplicationNavTitle(applicationId);
      if (!cancelled) {
        setJobTitle(title);
      }
    }

    loadTitle();

    return () => {
      cancelled = true;
    };
  }, [applicationId, role]);

  return (
    <aside className="flex w-full flex-col border-b border-gray-200 bg-white lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef0ff] text-xs font-semibold text-[#2e46ba]">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            name.trim().charAt(0).toUpperCase() || "U"
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-gray-400">
            {getRoleLabel(role)}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-gray-950">
            {name}
          </p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
        {links.map((link) => {
          const active =
            link.href === "/dashboard" || link.href === "/admin"
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[#eef0ff] text-[#2E46BA]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}

        {role === "seeker" && applicationId && (
          <span
            title={jobTitle ?? "Application"}
            className="inline-flex items-center gap-2 rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2E46BA]"
          >
            <FileText size={16} className="shrink-0" />
            <span className="truncate">{jobTitle ?? "Loading…"}</span>
          </span>
        )}

        {role === "employer" && pathname.includes("/applicants") && (
          <span className="inline-flex items-center gap-2 rounded-lg bg-[#eef0ff] px-3 py-2 text-sm font-medium text-[#2E46BA]">
            <Users size={16} />
            Applicants
          </span>
        )}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-auto hidden rounded-none border-t border-gray-100 px-5 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 lg:block"
      >
        Sign out
      </button>
    </aside>
  );
}
