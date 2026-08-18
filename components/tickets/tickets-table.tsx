import Link from "next/link";
import type { Ticket } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusTag } from "@/components/shared/status-tag";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLE,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLE,
} from "@/lib/labels";
import { formatRelativeArabic } from "@/lib/format";

type TicketRow = Ticket & {
  customer: { id: string; fullName: string; customerNumber: string } | null;
  assignedTechnician: { id: string; name: string } | null;
};

// There is no dedicated auto-numbered ticket field in the schema — same
// rationale as transactionNumber() in components/payments/payments-table.tsx:
// a short uppercase slice of the record id stands in as an internal
// reference number, purely for display — never used as a lookup key.
function ticketNumber(ticket: TicketRow) {
  return `#${ticket.id.slice(-8).toUpperCase()}`;
}

export function TicketsTable({ tickets }: { tickets: TicketRow[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          لا توجد بلاغات مطابقة
        </p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل البحث أو الفلاتر، أو افتح بلاغاً جديداً.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الرقم</TableHead>
            <TableHead>العنوان</TableHead>
            <TableHead>المشترك</TableHead>
            <TableHead>التصنيف</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الفني المسؤول</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead className="text-end">آخر تحديث</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell dir="ltr" className="text-end font-mono text-muted-foreground">
                {ticketNumber(ticket)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ticket.customer ? (
                  <Link
                    href={`/customers/${ticket.customer.id}`}
                    className="hover:underline"
                  >
                    {ticket.customer.fullName}
                  </Link>
                ) : (
                  "بلاغ شبكة عام"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {TICKET_CATEGORY_LABELS[ticket.category]}
              </TableCell>
              <TableCell>
                <StatusTag
                  color={TICKET_PRIORITY_STYLE[ticket.priority].color}
                  tint={TICKET_PRIORITY_STYLE[ticket.priority].tint}
                  label={TICKET_PRIORITY_LABELS[ticket.priority]}
                />
              </TableCell>
              <TableCell>
                <StatusTag
                  color={TICKET_STATUS_STYLE[ticket.status].color}
                  tint={TICKET_STATUS_STYLE[ticket.status].tint}
                  label={TICKET_STATUS_LABELS[ticket.status]}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ticket.assignedTechnician?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeArabic(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-end text-muted-foreground">
                {formatRelativeArabic(ticket.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
