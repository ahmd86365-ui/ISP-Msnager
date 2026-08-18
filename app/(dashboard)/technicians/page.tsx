import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TicketsFilters } from "@/components/tickets/tickets-filters";
import { TicketsTable } from "@/components/tickets/tickets-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { auth } from "@/lib/auth";
import {
  getTicketQueueSummary,
  listActiveUsersForAssignSelect,
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

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    category?: string;
    technicianId?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  // On first visit (no technician chosen yet), default this work queue to
  // "assigned to me" rather than showing every technician's tickets. Once
  // technicianId is present in the URL — whether a real id or the literal
  // "all" written by TicketsFilters (see keepTechnicianIdInUrl) — this never
  // fires again, so explicitly picking "كل الفنيين" sticks.
  if (!params.technicianId) {
    const session = await auth();
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.status) qs.set("status", params.status);
    if (params.priority) qs.set("priority", params.priority);
    if (params.category) qs.set("category", params.category);
    if (params.createdFrom) qs.set("createdFrom", params.createdFrom);
    if (params.createdTo) qs.set("createdTo", params.createdTo);
    if (params.page) qs.set("page", params.page);
    qs.set("technicianId", session!.user.id);
    redirect(`/technicians?${qs.toString()}`);
  }

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
  const assignedTechnicianId =
    params.technicianId === "all" ? undefined : params.technicianId;

  const [{ tickets, total, pageCount, pageSize }, technicians, summary] = await Promise.all([
    listTickets({
      search: params.q,
      status,
      priority,
      category,
      assignedTechnicianId,
      createdFrom: params.createdFrom,
      createdTo: params.createdTo,
      page,
    }),
    listActiveUsersForAssignSelect(),
    getTicketQueueSummary(assignedTechnicianId),
  ]);

  const selectedTechnician = assignedTechnicianId
    ? technicians.find((t) => t.id === assignedTechnicianId)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">الفنيين</h1>
        <p className="text-sm text-muted-foreground">
          {selectedTechnician
            ? `أعمال الفني: ${selectedTechnician.name}`
            : "أعمال جميع الفنيين"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="بانتظار المعالجة"
          value={formatNumber(summary.openCount)}
          icon={ListChecks}
          accent="blue"
        />
        <StatCard
          label="حرجة أو عالية الأولوية ومفتوحة"
          value={formatNumber(summary.urgentOpenCount)}
          icon={AlertTriangle}
          accent="orange"
        />
        <StatCard
          label="تم حلها هذا الأسبوع"
          value={formatNumber(summary.resolvedThisWeekCount)}
          icon={CheckCircle2}
          accent="aqua"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <TicketsFilters
            technicians={technicians}
            showDateFilter
            keepTechnicianIdInUrl
          />
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
