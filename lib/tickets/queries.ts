import "server-only";

import type { Prisma, TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export interface ListTicketsParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTechnicianId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
}

export async function listTickets(params: ListTicketsParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.TicketWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      {
        customer: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { customerNumber: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.priority) {
    where.priority = params.priority;
  }
  if (params.category) {
    where.category = params.category;
  }
  if (params.assignedTechnicianId) {
    where.assignedTechnicianId = params.assignedTechnicianId;
  }
  if (params.createdFrom || params.createdTo) {
    where.createdAt = {};
    if (params.createdFrom) {
      where.createdAt.gte = new Date(params.createdFrom);
    }
    if (params.createdTo) {
      // Treat the "to" date as inclusive of the whole day.
      const to = new Date(params.createdTo);
      to.setDate(to.getDate() + 1);
      where.createdAt.lt = to;
    }
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { id: true, fullName: true, customerNumber: true } },
        assignedTechnician: { select: { id: true, name: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

const OPEN_QUEUE_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING"];
const RESOLVED_QUEUE_STATUSES: TicketStatus[] = ["RESOLVED", "CLOSED"];
const URGENT_PRIORITIES: TicketPriority[] = ["HIGH", "CRITICAL"];

export interface TicketQueueSummary {
  openCount: number;
  urgentOpenCount: number;
  resolvedThisWeekCount: number;
}

// Powers the technician work-queue stat cards — scoped to one technician
// when provided, otherwise across all tickets. A plain aggregate query, same
// shape as lib/dashboard/queries.ts, not a business-rule service.
export async function getTicketQueueSummary(
  assignedTechnicianId?: string,
): Promise<TicketQueueSummary> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const base: Prisma.TicketWhereInput = assignedTechnicianId
    ? { assignedTechnicianId }
    : {};

  const [openCount, urgentOpenCount, resolvedThisWeekCount] = await Promise.all([
    prisma.ticket.count({ where: { ...base, status: { in: OPEN_QUEUE_STATUSES } } }),
    prisma.ticket.count({
      where: {
        ...base,
        status: { in: OPEN_QUEUE_STATUSES },
        priority: { in: URGENT_PRIORITIES },
      },
    }),
    prisma.ticket.count({
      where: {
        ...base,
        status: { in: RESOLVED_QUEUE_STATUSES },
        resolvedAt: { gte: startOfWeek },
      },
    }),
  ]);

  return { openCount, urgentOpenCount, resolvedThisWeekCount };
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: {
        select: { id: true, fullName: true, customerNumber: true, phone: true },
      },
      assignedTechnician: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
}

// Feeds the "open ticket" dialog's customer select — same shape/size
// rationale as listCustomersWithSubscriptionsForPaymentForm in
// lib/payments/queries.ts (sized for this ISP's realistic customer count).
export async function listCustomersForTicketForm() {
  return prisma.customer.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, customerNumber: true },
  });
}

// Any active staff account can be assigned a ticket, not just role
// TECHNICIAN — the owner/admin frequently does the technical work directly
// on a small ISP (see docs/UI-UX.md primary-user note).
export async function listActiveUsersForAssignSelect() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });
}
