import type { SubscriptionStatus } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionsFilters } from "@/components/subscriptions/subscriptions-filters";
import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { listSubscriptions } from "@/lib/subscriptions/queries";
import { listAllPlansForFilter } from "@/lib/plans/queries";
import { formatNumber } from "@/lib/format";

const VALID_STATUSES: SubscriptionStatus[] = [
  "ACTIVE",
  "EXPIRED",
  "SUSPENDED",
  "CANCELLED",
  "PENDING",
];

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    planId?: string;
    endDateFrom?: string;
    endDateTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = VALID_STATUSES.includes(params.status as SubscriptionStatus)
    ? (params.status as SubscriptionStatus)
    : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ subscriptions, total, pageCount, pageSize }, plans] = await Promise.all([
    listSubscriptions({
      search: params.q,
      status,
      planId: params.planId,
      endDateFrom: params.endDateFrom,
      endDateTo: params.endDateTo,
      page,
    }),
    listAllPlansForFilter(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">الاشتراكات</h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(total)} اشتراك إجمالاً
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <SubscriptionsFilters plans={plans} />
          <SubscriptionsTable subscriptions={subscriptions} />
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
