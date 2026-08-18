// Pure calc, kept separate from queries.ts so it's directly unit-testable
// without a live database (this project's test environment has no DB — see
// tests/unit/reports-resolution-time.test.ts). Mirrors the
// lib/payments/balance.ts / lib/subscriptions/billing.ts split.

export interface ResolvedTicketTiming {
  createdAt: Date;
  resolvedAt: Date;
}

// Average hours between a ticket's creation and its resolution. Returns null
// (not 0) when there is nothing to average, so callers can render "لا توجد
// بيانات كافية" instead of a misleading "0 hours".
export function computeAverageResolutionHours(
  tickets: ResolvedTicketTiming[],
): number | null {
  if (tickets.length === 0) {
    return null;
  }

  const totalHours = tickets.reduce((sum, ticket) => {
    const hours =
      (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    return sum + Math.max(0, hours);
  }, 0);

  return totalHours / tickets.length;
}
