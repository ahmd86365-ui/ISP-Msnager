import type { TicketStatus } from "@prisma/client";

const TERMINAL_STATUSES: TicketStatus[] = ["RESOLVED", "CLOSED"];

export interface TicketStatusChangeFields {
  status: TicketStatus;
  resolvedAt: Date | null;
  resolvedById: string | null;
}

// Moving INTO a terminal status (RESOLVED/CLOSED) stamps who closed the
// ticket and when; moving back OUT of one (reopening) clears that stamp so
// it doesn't keep pointing at a stale resolution.
export function computeTicketStatusChange(
  newStatus: TicketStatus,
  actorId: string,
  now: Date = new Date(),
): TicketStatusChangeFields {
  const isTerminal = TERMINAL_STATUSES.includes(newStatus);
  return {
    status: newStatus,
    resolvedAt: isTerminal ? now : null,
    resolvedById: isTerminal ? actorId : null,
  };
}
