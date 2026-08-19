import "server-only";

import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { TICKET_STATUS_LABELS } from "@/lib/labels";
import { createNotification, notifyActiveAdmins } from "@/lib/notifications/service";
import { computeTicketStatusChange } from "./status";

export async function createTicket(params: {
  customerId?: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  assignedTechnicianId?: string;
  notes?: string;
  actorId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        customerId: params.customerId,
        title: params.title,
        description: params.description,
        category: params.category,
        priority: params.priority,
        assignedTechnicianId: params.assignedTechnicianId,
        notes: params.notes,
        createdById: params.actorId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: "TICKET_CREATED",
        entityType: "Ticket",
        entityId: ticket.id,
        summary: `تم فتح بلاغ: ${ticket.title}`,
      },
    });

    // CRITICAL tickets page every active OWNER/ADMIN — see the approved
    // Notifications plan's fixed rule set (not configurable/invented here).
    if (ticket.priority === "CRITICAL") {
      await notifyActiveAdmins(
        {
          type: "TICKET_CRITICAL_CREATED",
          title: "بلاغ حرج جديد",
          body: ticket.title,
          relatedEntityType: "Ticket",
          relatedEntityId: ticket.id,
        },
        tx,
      );
    }

    return ticket;
  });
}

export async function updateTicketStatus(params: {
  ticketId: string;
  status: TicketStatus;
  actorId: string;
}) {
  const change = computeTicketStatusChange(params.status, params.actorId);

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.update({
      where: { id: params.ticketId },
      data: change,
    });

    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: "TICKET_STATUS_CHANGED",
        entityType: "Ticket",
        entityId: ticket.id,
        summary: `تم تغيير حالة البلاغ "${ticket.title}" إلى ${TICKET_STATUS_LABELS[params.status]}`,
      },
    });

    return ticket;
  });
}

export async function assignTicketTechnician(params: {
  ticketId: string;
  assignedTechnicianId?: string;
  actorId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const previous = await tx.ticket.findUniqueOrThrow({
      where: { id: params.ticketId },
      select: { assignedTechnicianId: true },
    });

    const ticket = await tx.ticket.update({
      where: { id: params.ticketId },
      data: { assignedTechnicianId: params.assignedTechnicianId ?? null },
    });

    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: "TICKET_ASSIGNED",
        entityType: "Ticket",
        entityId: ticket.id,
        summary: params.assignedTechnicianId
          ? `تم إسناد البلاغ "${ticket.title}" إلى فني`
          : `تم إلغاء إسناد البلاغ "${ticket.title}"`,
      },
    });

    // Only a genuinely new assignee is notified — reassigning to the same
    // technician or unassigning entirely doesn't page anyone.
    const isNewAssignment =
      ticket.assignedTechnicianId !== null &&
      ticket.assignedTechnicianId !== previous.assignedTechnicianId;
    if (isNewAssignment) {
      await createNotification(
        {
          recipientId: ticket.assignedTechnicianId!,
          type: "TICKET_ASSIGNED",
          title: "تم إسنادك إلى بلاغ",
          body: ticket.title,
          relatedEntityType: "Ticket",
          relatedEntityId: ticket.id,
        },
        tx,
      );
    }

    return ticket;
  });
}

export async function addTicketComment(params: {
  ticketId: string;
  body: string;
  actorId: string;
}) {
  return prisma.ticketComment.create({
    data: {
      ticketId: params.ticketId,
      body: params.body,
      authorId: params.actorId,
    },
  });
}
