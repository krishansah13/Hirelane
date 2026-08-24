import { Briefcase, FileQuestion, LayoutDashboard } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
    title: "Application not found | Hirelane",
};

export default function ApplicationNotFound() {
    return (
        <StatusScreen
            embedded
            eyebrow="Error 404"
            code="404"
            icon={FileQuestion}
            title="Application not found"
            description="We couldn't find this application on your account. It may have been withdrawn, or the link belongs to someone else."
            primaryAction={{
                href: "/dashboard",
                label: "My applications",
                icon: LayoutDashboard,
            }}
            secondaryAction={{ href: "/jobs", label: "Find jobs", icon: Briefcase }}
        />
    );
}
