import Profile from "@/components/Profile";
import { requireUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/utils/db";
import User from "@/lib/models/User";

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-gray-400">
          {sessionUser.role === "employer" ? "EMPLOYER" : "SEEKER"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Account
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Update your name, mobile number, and profile photo.
        </p>
      </div>
      <Profile name={name} email={email} mobile={mobile} image={image} />
    </div>
  );
}
