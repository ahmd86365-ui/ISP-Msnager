import Link from "next/link";
import type { Subscription } from "@prisma/client";

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

type HistoryRow = Subscription & { plan: { name: string } };

export function SubscriptionHistoryTable({
  subscriptions,
}: {
  subscriptions: HistoryRow[];
}) {
  if (subscriptions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        لا يوجد اشتراكات سابقة أخرى لهذا المشترك.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الباقة</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>تاريخ البداية</TableHead>
            <TableHead>تاريخ النهاية</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>
                <Link
                  href={`/subscriptions/${subscription.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {subscription.plan.name}
                </Link>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
