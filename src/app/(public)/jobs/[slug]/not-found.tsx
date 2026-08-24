import { Briefcase, Home, SearchX } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
    title: "Job not found | Hirelane",
};

export default function JobNotFound() {
    return (
        <StatusScreen
            eyebrow="Error 404"
            code="404"
            icon={SearchX}
            title="This role is no longer open"
            description="The job you're after was closed, expired, or the link is out of date. Plenty of other teams are still hiring."
            primaryAction={{
                href: "/jobs",
                label: "Browse open roles",
                icon: Briefcase,
            }}
            secondaryAction={{ href: "/", label: "Back to home", icon: Home }}
        />
    );
}
