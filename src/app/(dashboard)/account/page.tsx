import Profile from "@/components/Profile";
import ResumeManager from "@/components/account/ResumeManager";
import { requireUser } from "@/lib/session";
import { formatRoleName, getHomePath } from "@/lib/roles";
import { connectToDatabase } from "@/lib/utils/db";
import User from "@/lib/models/User";
import { listSeekerResumes } from "@/lib/resume-query";
import { MAX_SAVED_RESUMES } from "@/lib/utils/resume";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

function firstName(name?: string | null) {
  const part = name?.trim().split(/\s+/)[0];
  return part || null;
}

export default async function AccountPage() {
  const sessionUser = await requireUser();
  await connectToDatabase();

  const profile = await User.findById(sessionUser.id)
    .select("name email image mobile")
    .lean();

  const name = profile?.name ?? sessionUser.name ?? "";
  const email = profile?.email ?? sessionUser.email ?? "";
  const image = profile?.image ?? "";
  const mobile = profile?.mobile ?? "";
  const isSeeker = sessionUser.role === "seeker";
  const resumes = isSeeker ? await listSeekerResumes(sessionUser.id) : [];
  const defaultResume = resumes.find((resume) => resume.isDefault) ?? resumes[0];
  const greeting = firstName(name);
  const homeHref = getHomePath(sessionUser.role);

  const statCards = isSeeker
    ? [
        {
          label: "Resumes",
          value: `${resumes.length}/${MAX_SAVED_RESUMES}`,
          hint: resumes.length === 1 ? "Saved PDF" : "Saved PDFs",
        },
        {
          label: "Used when applying",
          value: defaultResume?.label ?? "Not set",
          hint: defaultResume
            ? "Default for new applications"
            : "Save a resume to choose one",
        },
        {
          label: "Mobile",
          value: mobile || "Not set",
          hint: "Shown to employers",
        },
        {
          label: "Account",
          value: formatRoleName(sessionUser.role),
          hint: "Signed in as this role",
        },
      ]
    : [
        {
          label: "Account",
          value: formatRoleName(sessionUser.role),
          hint: "Signed in as this role",
        },
        {
          label: "Mobile",
          value: mobile || "Not set",
          hint: "Contact on file",
        },
      ];

  return (
    <div className="mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-100 from-white via-white to-indigo-200 p-6 shadow-sm sm:p-8">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#2E46BA]">
              <Sparkles size={13} />
              {greeting ? `Your account, ${greeting}` : "Your account"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Settings
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              {isSeeker
                ? "Configure your profile and choose which saved resume is used when you apply."
                : "Configure your name, mobile number, and profile photo."}
            </p>
          </div>

          <Link
            href={homeHref}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#2E46BA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2E46BA]/15 transition hover:bg-[#1739ad]"
          >
            Back to dashboard
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <dl
        className={`grid grid-cols-2 gap-3 ${
          isSeeker ? "lg:grid-cols-4" : "sm:grid-cols-2"
        }`}
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-5"
          >
            <dt className="text-xs font-medium tracking-wide text-gray-400">
              {stat.label}
            </dt>
            <dd className="mt-2 truncate text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
              {stat.value}
            </dd>
            <p className="mt-1 text-xs text-gray-400">{stat.hint}</p>
          </div>
        ))}
      </dl>

      <Profile name={name} email={email} mobile={mobile} image={image} />
      {isSeeker ? <ResumeManager resumes={resumes} /> : null}
    </div>
  );
}
