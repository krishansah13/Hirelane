import { Building2, FolderX } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";

export const metadata = {
  title: "Company not found | Hirelane",
};

export default function AdminCompanyNotFound() {
  return (
    <StatusScreen
      embedded
      eyebrow="Error 404"
      code="404"
      icon={FolderX}
      title="Company not found"
      description="This company is no longer on the platform, or the link is invalid."
      primaryAction={{
        href: "/admin/companies",
        label: "All companies",
        icon: Building2,
      }}
    />
  );
}
