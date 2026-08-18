import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { AddTicketDialog } from "@/components/tickets/add-ticket-dialog";
import { TicketsFilters } from "@/components/tickets/tickets-filters";
import { TicketsTable } from "@/components/tickets/tickets-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import {
  listActiveUsersForAssignSelect,
  listCustomersForTicketForm,
  listTickets,
} from "@/lib/tickets/queries";
import { formatNumber } from "@/lib/format";

const VALID_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const VALID_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const VALID_CATEGORIES: TicketCategory[] = [
  "INTERNET_DOWN",
  "SLOW_SPEED",
  "SIGNAL",
  "DEVICE",
  "CABLE",
  "BILLING",
  "INSTALLATION",
  "OTHER",
];

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    category?: string;
    technicianId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = VALID_STATUSES.includes(params.status as TicketStatus)
    ? (params.status as TicketStatus)
    : undefined;
  const priority = VALID_PRIORITIES.includes(params.priority as TicketPriority)
    ? (params.priority as TicketPriority)
    : undefined;
  const category = VALID_CATEGORIES.includes(params.category as TicketCategory)
    ? (params.category as TicketCategory)
    : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ tickets, total, pageCount, pageSize }, customers, technicians] = await Promise.all([
    listTickets({
      search: params.q,
      status,
      priority,
      category,
      assignedTechnicianId: params.technicianId,
      page,
    }),
    listCustomersForTicketForm(),
    listActiveUsersForAssignSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الأعطال</h1>
          <p className="text-sm text-muted-foreground">{formatNumber(total)} بلاغ إجمالاً</p>
        </div>
        <AddTicketDialog customers={customers} technicians={technicians} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <TicketsFilters technicians={technicians} />
          <TicketsTable tickets={tickets} />
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
