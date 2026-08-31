import QueryPagination from "@/components/ui/QueryPagination";
import {
  buildAdminCompaniesHref,
  type AdminCompanyQuery,
} from "@/lib/admin-company-query";

export default function AdminCompaniesPagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: AdminCompanyQuery;
}) {
  return (
    <QueryPagination
      page={page}
      totalPages={totalPages}
      hrefForPage={(nextPage) => buildAdminCompaniesHref(params, nextPage)}
    />
  );
}
