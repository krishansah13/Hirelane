import { Briefcase, FolderX, PlusCircle } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
    title: "Role not found | Hirelane",
};

export default function EmployerJobNotFound() {
    return (
        <StatusScreen
            embedded
            eyebrow="Error 404"
            code="404"
            icon={FolderX}
            title="Role not found"
            description="This job isn't listed under your company anymore. It may have been deleted, or the link points somewhere you can't access."
            primaryAction={{
                href: "/employer",
                label: "Posted roles",
                icon: Briefcase,
            }}
            secondaryAction={{
                href: "/employer/jobs/new",
                label: "Post a job",
                icon: PlusCircle,
            }}
        />
    );
}
