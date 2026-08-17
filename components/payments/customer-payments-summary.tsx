import Link from "next/link";
import type { Payment } from "@prisma/client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusTag } from "@/components/shared/status-tag";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import { formatSyp } from "@/lib/format";
import { PaymentStatusBadge } from "./payment-status-badge";
import { CustomerAddPaymentDialog } from "./customer-add-payment-dialog";
import type { SubscriptionOption } from "./payment-form";

type RecentPayment = Payment & {
  subscription: { plan: { name: string } } | null;
};

export function CustomerPaymentsSummary({
  customerId,
  payments,
  totalPaidSyp,
  debtSyp,
  subscriptions,
}: {
  customerId: string;
  payments: RecentPayment[];
  totalPaidSyp: number;
  debtSyp: number;
  subscriptions: SubscriptionOption[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الدفعات</CardTitle>
        <CardAction>
          <CustomerAddPaymentDialog customerId={customerId} subscriptions={subscriptions} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 border-b pb-3">
          <div>
            <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
            <p className="text-base font-medium text-foreground">
              {formatSyp(totalPaidSyp)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">الرصيد</p>
            {debtSyp > 0 ? (
              <StatusTag
                color="var(--status-critical)"
                tint="bg-status-critical/10"
                label={`مستحق: ${formatSyp(debtSyp)}`}
              />
            ) : (
              <StatusTag
                color="var(--status-good)"
                tint="bg-status-good/10"
                label="لا يوجد مستحقات"
              />
            )}
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا توجد دفعات مسجّلة لهذا المشترك بعد.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground">{formatSyp(payment.amountSyp)}</span>
                  <span className="text-xs text-muted-foreground">
                    {payment.paidAt.toLocaleDateString("en-CA")} ·{" "}
                    {PAYMENT_METHOD_LABELS[payment.method]}
                    {payment.subscription ? ` · ${payment.subscription.plan.name}` : ""}
                  </span>
                </div>
                <PaymentStatusBadge isVoided={payment.isVoided} />
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/payments?customerId=${customerId}`}
          className="text-sm text-primary hover:underline"
        >
          عرض كل دفعات المشترك
        </Link>
      </CardContent>
    </Card>
  );
}
