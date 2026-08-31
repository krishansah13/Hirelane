import QueryPagination from "@/components/ui/QueryPagination";
import { buildAdminJobsHref, type AdminJobQuery } from "@/lib/admin-job-query";

export default function AdminJobsPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: AdminJobQuery;
}) {
  return (
    <QueryPagination
      page={page}
      totalPages={totalPages}
      hrefForPage={(nextPage) => buildAdminJobsHref(params, nextPage)}
    />
  );
}
