import Link from "next/link";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusTag } from "@/components/shared/status-tag";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLE,
} from "@/lib/labels";
import { formatRelativeArabic } from "@/lib/format";
import { CustomerAddTicketDialog } from "@/components/tickets/customer-add-ticket-dialog";
import type { TechnicianOption } from "@/components/tickets/ticket-form";

interface TicketRow {
  id: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
}

export function CustomerTicketsSummary({
  customerId,
  tickets,
  technicians,
}: {
  customerId: string;
  tickets: TicketRow[];
  technicians: TechnicianOption[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>آخر الأعطال</CardTitle>
        <CardAction>
          <CustomerAddTicketDialog customerId={customerId} technicians={technicians} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا توجد أعطال مسجّلة لهذا المشترك.
          </p>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {ticket.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {TICKET_CATEGORY_LABELS[ticket.category]}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusTag
                  color={TICKET_PRIORITY_STYLE[ticket.priority].color}
                  tint={TICKET_PRIORITY_STYLE[ticket.priority].tint}
                  label={TICKET_PRIORITY_LABELS[ticket.priority]}
                />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeArabic(ticket.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
