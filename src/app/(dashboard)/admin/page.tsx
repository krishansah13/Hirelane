import { BarChart3, Briefcase, Users } from "lucide-react";
import { requireAdmin } from "@/lib/session";

const PLACEHOLDER_SECTIONS = [
  {
    title: "User management",
    description:
      "Review seekers and employers, and manage account access from one place.",
    icon: Users,
  },
  {
    title: "Job moderation",
    description:
      "Review posted roles, handle reports, and keep the public board clean.",
    icon: Briefcase,
  },
  {
    title: "Analytics",
    description:
      "Track applications, hiring activity, and platform health at a glance.",
    icon: BarChart3,
  },
] as const;

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Welcome{user.name ? `, ${user.name}` : ""}. Platform tools will live
          here. Nothing in these sections is wired up yet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef0ff] text-[#2E46BA]">
                  <Icon size={18} />
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium tracking-wide text-gray-500">
                  Coming soon
                </span>
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-950">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {section.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
