import Link from "next/link";
import type { Payment } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import { formatSyp } from "@/lib/format";
import { PaymentStatusBadge } from "./payment-status-badge";
import { VoidPaymentDialog } from "./void-payment-dialog";

type PaymentRow = Payment & {
  customer: { id: string; fullName: string; customerNumber: string };
  subscription: { id: string; plan: { name: string } } | null;
};

// There is no dedicated auto-numbered payment/receipt field in the schema.
// The optional bank/wallet "reference" is shown when present; otherwise a
// short uppercase slice of the record id stands in as an internal
// transaction number, purely for display — never used as a lookup key.
function transactionNumber(payment: PaymentRow) {
  return payment.reference || payment.id.slice(-8).toUpperCase();
}

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          لا توجد دفعات مطابقة
        </p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل البحث أو الفلاتر، أو أضف دفعة جديدة.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم العملية</TableHead>
            <TableHead>المشترك</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>تاريخ الدفع</TableHead>
            <TableHead>الاشتراك المرتبط</TableHead>
            <TableHead>طريقة الدفع</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell dir="ltr" className="text-end font-mono text-muted-foreground">
                {transactionNumber(payment)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/customers/${payment.customer.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {payment.customer.fullName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {payment.customer.customerNumber}
                </p>
              </TableCell>
              <TableCell className="text-foreground">
                {formatSyp(payment.amountSyp)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.paidAt.toLocaleDateString("en-CA")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.subscription ? payment.subscription.plan.name : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {PAYMENT_METHOD_LABELS[payment.method]}
              </TableCell>
              <TableCell>
                <PaymentStatusBadge isVoided={payment.isVoided} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  {!payment.isVoided && (
                    <VoidPaymentDialog paymentId={payment.id} amountSyp={payment.amountSyp} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
