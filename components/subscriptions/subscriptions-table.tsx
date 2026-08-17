import Link from "next/link";
import { Eye } from "lucide-react";
import type { Subscription } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSyp } from "@/lib/format";
import { SubscriptionStatusBadge } from "./subscription-status-badge";

type SubscriptionRow = Subscription & {
  customer: { id: string; fullName: string; customerNumber: string; phone: string };
  plan: { id: string; name: string };
};

export function SubscriptionsTable({
  subscriptions,
}: {
  subscriptions: SubscriptionRow[];
}) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          لا توجد اشتراكات مطابقة
        </p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل البحث أو الفلاتر.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المشترك</TableHead>
            <TableHead>الباقة</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>تاريخ البداية</TableHead>
            <TableHead>تاريخ النهاية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>
                <Link
                  href={`/customers/${subscription.customer.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {subscription.customer.fullName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {subscription.customer.customerNumber}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {subscription.plan.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatSyp(subscription.priceAtSubscriptionSyp)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {subscription.startDate.toLocaleDateString("en-CA")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {subscription.endDate.toLocaleDateString("en-CA")}
              </TableCell>
              <TableCell>
                <SubscriptionStatusBadge status={subscription.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/subscriptions/${subscription.id}`} />}
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">عرض</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
