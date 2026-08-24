import { Compass, Briefcase, Home } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
    title: "Page not found | Hirelane",
};

export default function NotFound() {
    return (
        <StatusScreen
            eyebrow="Error 404"
            code="404"
            icon={Compass}
            title="This lane leads nowhere"
            description="The page you're looking for doesn't exist or may have been moved. Head back and keep exploring opportunities."
            primaryAction={{ href: "/jobs", label: "Browse jobs", icon: Briefcase }}
            secondaryAction={{ href: "/", label: "Back to home", icon: Home }}
        />
    );
}
