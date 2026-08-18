import Link from "next/link";
import type { TicketPriority, TicketStatus, TicketCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLE,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLE,
} from "@/lib/labels";
import { formatRelativeArabic } from "@/lib/format";
import { StatusTag } from "@/components/shared/status-tag";

export interface RecentTicket {
  id: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  customer: { fullName: string } | null;
}

export function RecentTickets({ tickets }: { tickets: RecentTicket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>أحدث الأعطال</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {tickets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد أعطال مفتوحة حالياً
          </p>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {ticket.customer?.fullName ?? "بلاغ شبكة عام"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {TICKET_CATEGORY_LABELS[ticket.category]}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5">
                  <StatusTag
                    color={TICKET_PRIORITY_STYLE[ticket.priority].color}
                    tint={TICKET_PRIORITY_STYLE[ticket.priority].tint}
                    label={TICKET_PRIORITY_LABELS[ticket.priority]}
                  />
                  <StatusTag
                    color={TICKET_STATUS_STYLE[ticket.status].color}
                    tint={TICKET_STATUS_STYLE[ticket.status].tint}
                    label={TICKET_STATUS_LABELS[ticket.status]}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeArabic(ticket.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}

        <Button
          variant="secondary"
          className="mt-3 w-full"
          nativeButton={false}
          render={<Link href="/tickets" />}
        >
          عرض جميع الأعطال
        </Button>
      </CardContent>
    </Card>
  );
}
