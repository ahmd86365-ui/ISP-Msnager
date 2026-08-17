import type { PaymentMethod } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { AddPaymentDialog } from "@/components/payments/add-payment-dialog";
import { PaymentsFilters } from "@/components/payments/payments-filters";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import {
  listCustomersWithSubscriptionsForPaymentForm,
  listPayments,
} from "@/lib/payments/queries";
import { formatNumber } from "@/lib/format";

const VALID_METHODS: PaymentMethod[] = ["CASH", "TRANSFER", "WALLET", "OTHER"];
const VALID_STATUSES = ["active", "voided"] as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    method?: string;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const method = VALID_METHODS.includes(params.method as PaymentMethod)
    ? (params.method as PaymentMethod)
    : undefined;
  const status = VALID_STATUSES.includes(params.status as (typeof VALID_STATUSES)[number])
    ? (params.status as (typeof VALID_STATUSES)[number])
    : undefined;
  const isVoided = status === "voided" ? true : status === "active" ? false : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ payments, total, pageCount, pageSize }, customers] = await Promise.all([
    listPayments({
      search: params.q,
      method,
      isVoided,
      customerId: params.customerId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      page,
    }),
    listCustomersWithSubscriptionsForPaymentForm(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الدفعات</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(total)} دفعة إجمالاً
          </p>
        </div>
        <AddPaymentDialog customers={customers} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <PaymentsFilters customers={customers} />
          <PaymentsTable payments={payments} />
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
