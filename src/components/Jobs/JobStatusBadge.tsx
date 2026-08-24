const STATUS_STYLES: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-emerald-50 text-emerald-800",
    expired: "bg-rose-50 text-rose-700",
};

export default function JobStatusBadge({status} : {status : string}) {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const styles = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
            {label}
        </span>
    )
}