import type { CustomerStatus } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { CustomersFilters } from "@/components/customers/customers-filters";
import { CustomersTable } from "@/components/customers/customers-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { listBuildingsForSelect, listCustomers } from "@/lib/customers/queries";
import { formatNumber } from "@/lib/format";

const VALID_STATUSES: CustomerStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    buildingId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = VALID_STATUSES.includes(params.status as CustomerStatus)
    ? (params.status as CustomerStatus)
    : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ customers, total, pageCount, pageSize }, buildings] =
    await Promise.all([
      listCustomers({
        search: params.q,
        status,
        buildingId: params.buildingId,
        page,
      }),
      listBuildingsForSelect(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            المشتركين
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(total)} مشترك إجمالاً
          </p>
        </div>
        <AddCustomerDialog buildings={buildings} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <CustomersFilters buildings={buildings} />
          <CustomersTable customers={customers} buildings={buildings} />
          {total > 0 && (
            <PaginationControls
              page={page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
