import { Briefcase, FolderX } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
  title: "Job not found | Hirelane",
};

export default function AdminJobNotFound() {
  return (
    <StatusScreen
      embedded
      eyebrow="Error 404"
      code="404"
      icon={FolderX}
      title="Job not found"
      description="This role is no longer on the platform, or the link is invalid."
      primaryAction={{
        href: "/admin/jobs",
        label: "All jobs",
        icon: Briefcase,
      }}
    />
  );
}
