import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getHomePath } from "@/lib/roles";

export default async function SeekerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== "seeker") {
        redirect(getHomePath(session.user.role));
    }

    return <>{children}</>;
}
