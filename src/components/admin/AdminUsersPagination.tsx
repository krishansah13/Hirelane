import QueryPagination from "@/components/ui/QueryPagination";
import { buildAdminUsersHref, type AdminUserQuery } from "@/lib/admin-query";

export default function AdminUsersPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: AdminUserQuery;
}) {
  return (
    <QueryPagination
      page={page}
      totalPages={totalPages}
      hrefForPage={(nextPage) => buildAdminUsersHref(params, nextPage)}
    />
  );
}
