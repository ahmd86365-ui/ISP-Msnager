import "server-only";

import { prisma } from "@/lib/prisma";
import { computeDebtSyp, sumDueSubscriptions, sumNonVoidedPayments } from "@/lib/payments/balance";
import { computeAverageResolutionHours } from "./resolution-time";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  NETWORK_DEVICE_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/labels";

// Shared date-range shape for every "within selected period" report below.
// Snapshot reports (current totals/status breakdowns) intentionally ignore
// this — see each function's comment.
export interface ReportDateRange {
  from?: string;
  to?: string;
}

function dateRangeFilter(range: ReportDateRange): { gte?: Date; lt?: Date } | undefined {
  if (!range.from && !range.to) {
    return undefined;
  }
  const filter: { gte?: Date; lt?: Date } = {};
  if (range.from) {
    filter.gte = new Date(range.from);
  }
  if (range.to) {
    // Treat the "to" date as inclusive of the whole day.
    const to = new Date(range.to);
    to.setDate(to.getDate() + 1);
    filter.lt = to;
  }
  return filter;
}

export interface ReportBreakdownItem {
  key: string;
  label: string;
  value: number;
  percentage: number;
}

function toBreakdown<T extends string>(
  grouped: { key: T; value: number }[],
  labels: Record<T, string>,
): ReportBreakdownItem[] {
  const total = grouped.reduce((sum, g) => sum + g.value, 0);
  return grouped
    .map((g) => ({
      key: g.key,
      label: labels[g.key],
      value: g.value,
      percentage: total > 0 ? Math.round((g.value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface CustomerReportSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  newInRange: number;
}

// total/active/inactive/archived are current snapshots. newInRange respects
// the date range and falls back to "since the beginning" when no range is
// selected (an unrestricted createdAt filter), which the page labels clearly.
export async function getCustomerReportSummary(
  range: ReportDateRange,
): Promise<CustomerReportSummary> {
  const [total, statusGroups, newInRange] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.customer.count({ where: { createdAt: dateRangeFilter(range) } }),
  ]);

  const counts = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));

  return {
    total,
    active: counts.ACTIVE ?? 0,
    inactive: counts.INACTIVE ?? 0,
    archived: counts.ARCHIVED ?? 0,
    newInRange,
  };
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export interface SubscriptionStatusReport {
  active: number;
  expired: number;
  suspended: number;
  cancelled: number;
  pending: number;
}

// A current snapshot across all 5 statuses — deliberately a new function
// rather than reusing lib/dashboard/queries.ts's getSubscriptionStatusBreakdown,
// which only covers 3 statuses for the dashboard donut chart and shouldn't be
// changed for this unrelated page.
export async function getSubscriptionStatusReport(): Promise<SubscriptionStatusReport> {
  const grouped = await prisma.subscription.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));

  return {
    active: counts.ACTIVE ?? 0,
    expired: counts.EXPIRED ?? 0,
    suspended: counts.SUSPENDED ?? 0,
    cancelled: counts.CANCELLED ?? 0,
    pending: counts.PENDING ?? 0,
  };
}

// Counts Subscription rows created within the range. The schema has no
// separate renewal-event record (renewing creates a new Subscription row —
// see lib/subscriptions/service.ts), so this necessarily counts new
// sign-ups and renewals together; the page labels it accordingly.
export async function getSubscriptionsCreatedInRange(range: ReportDateRange): Promise<number> {
  return prisma.subscription.count({ where: { createdAt: dateRangeFilter(range) } });
}

// ---------------------------------------------------------------------------
// Payments / Finance
// ---------------------------------------------------------------------------

export interface PaymentsReportSummary {
  totalAmountSyp: number;
  count: number;
  voidedCount: number;
}

export async function getPaymentsReportSummary(
  range: ReportDateRange,
): Promise<PaymentsReportSummary> {
  const paidAtFilter = dateRangeFilter(range);
  const [totals, count, voidedCount] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountSyp: true },
      where: { isVoided: false, paidAt: paidAtFilter },
    }),
    prisma.payment.count({ where: { isVoided: false, paidAt: paidAtFilter } }),
    prisma.payment.count({ where: { isVoided: true, paidAt: paidAtFilter } }),
  ]);

  return {
    totalAmountSyp: totals._sum.amountSyp ?? 0,
    count,
    voidedCount,
  };
}

export async function getPaymentsByMethod(range: ReportDateRange): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.payment.groupBy({
    by: ["method"],
    where: { isVoided: false, paidAt: dateRangeFilter(range) },
    _sum: { amountSyp: true },
  });
  return toBreakdown(
    grouped.map((g) => ({ key: g.method, value: g._sum.amountSyp ?? 0 })),
    PAYMENT_METHOD_LABELS,
  );
}

export interface OutstandingBalanceSummary {
  totalDueSyp: number;
  totalPaidSyp: number;
  debtSyp: number;
}

// A current snapshot (debt is inherently point-in-time, not range-scoped).
// Reuses lib/payments/balance.ts's exact pure functions — the same math
// getCustomerBalance() uses per-customer — just applied across every
// customer at once rather than reimplementing the debt calculation.
export async function getOutstandingBalanceSummary(): Promise<OutstandingBalanceSummary> {
  const [subscriptions, payments] = await Promise.all([
    prisma.subscription.findMany({
      select: { priceAtSubscriptionSyp: true, startDate: true },
    }),
    prisma.payment.findMany({ select: { amountSyp: true, isVoided: true } }),
  ]);

  const totalDueSyp = sumDueSubscriptions(subscriptions);
  const totalPaidSyp = sumNonVoidedPayments(payments);
  const debtSyp = computeDebtSyp(totalDueSyp, totalPaidSyp);

  return { totalDueSyp, totalPaidSyp, debtSyp };
}

export interface MonthlyRevenuePoint {
  month: string;
  amountSyp: number;
}

const ARABIC_MONTH_LABELS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// A fixed trailing window (not the shared date-range filter) — same
// "last N months" trend shape as the dashboard's chart, but built entirely
// from real Payment rows instead of mock data.
export async function getMonthlyRevenueTrend(monthsBack = 6): Promise<MonthlyRevenuePoint[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const payments = await prisma.payment.findMany({
    where: { isVoided: false, paidAt: { gte: start } },
    select: { amountSyp: true, paidAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }

  for (const payment of payments) {
    const key = `${payment.paidAt.getFullYear()}-${payment.paidAt.getMonth()}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + payment.amountSyp);
    }
  }

  return Array.from(buckets.entries()).map(([key, amountSyp]) => {
    const monthIndex = Number(key.split("-")[1]);
    return { month: ARABIC_MONTH_LABELS[monthIndex], amountSyp };
  });
}

// ---------------------------------------------------------------------------
// Tickets / Support
// ---------------------------------------------------------------------------

export interface TicketsStatusReport {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
}

export async function getTicketsStatusReport(range: ReportDateRange): Promise<TicketsStatusReport> {
  const grouped = await prisma.ticket.groupBy({
    by: ["status"],
    where: { createdAt: dateRangeFilter(range) },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return {
    total,
    open: counts.OPEN ?? 0,
    inProgress: counts.IN_PROGRESS ?? 0,
    waiting: counts.WAITING ?? 0,
    resolved: counts.RESOLVED ?? 0,
    closed: counts.CLOSED ?? 0,
  };
}

export async function getTicketsByPriority(range: ReportDateRange): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.ticket.groupBy({
    by: ["priority"],
    where: { createdAt: dateRangeFilter(range) },
    _count: { _all: true },
  });
  return toBreakdown(
    grouped.map((g) => ({ key: g.priority, value: g._count._all })),
    TICKET_PRIORITY_LABELS,
  );
}

export async function getTicketsByCategory(range: ReportDateRange): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.ticket.groupBy({
    by: ["category"],
    where: { createdAt: dateRangeFilter(range) },
    _count: { _all: true },
  });
  return toBreakdown(
    grouped.map((g) => ({ key: g.category, value: g._count._all })),
    TICKET_CATEGORY_LABELS,
  );
}

export async function getTicketsByTechnician(range: ReportDateRange): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.ticket.groupBy({
    by: ["assignedTechnicianId"],
    where: { createdAt: dateRangeFilter(range) },
    _count: { _all: true },
  });
  const technicianIds = grouped
    .map((g) => g.assignedTechnicianId)
    .filter((id): id is string => id !== null);
  const technicians = await prisma.user.findMany({
    where: { id: { in: technicianIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(technicians.map((t) => [t.id, t.name]));
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return grouped
    .map((g) => ({
      key: g.assignedTechnicianId ?? "__unassigned__",
      label: g.assignedTechnicianId
        ? (nameById.get(g.assignedTechnicianId) ?? "فني محذوف")
        : "غير مسند",
      value: g._count._all,
      percentage: total > 0 ? Math.round((g._count._all / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// Average resolution time for tickets resolved within the range (falls back
// to "ever" when no range is selected, same convention as newInRange above).
export async function getAverageResolutionHours(range: ReportDateRange): Promise<number | null> {
  const tickets = await prisma.ticket.findMany({
    where: {
      resolvedAt: { not: null, ...dateRangeFilter(range) },
    },
    select: { createdAt: true, resolvedAt: true },
  });
  return computeAverageResolutionHours(
    tickets
      .filter((t): t is { createdAt: Date; resolvedAt: Date } => t.resolvedAt !== null),
  );
}

export interface WeeklyTicketPoint {
  weekLabel: string;
  count: number;
}

// A fixed trailing window (like the revenue trend above), not the shared
// date-range filter — a "last N weeks" volume trend.
export async function getTicketsCreatedTrend(weeksBack = 8): Promise<WeeklyTicketPoint[]> {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const rangeStart = new Date(startOfThisWeek);
  rangeStart.setDate(rangeStart.getDate() - (weeksBack - 1) * 7);

  const tickets = await prisma.ticket.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: { createdAt: true },
  });

  const weekStarts: Date[] = [];
  for (let i = 0; i < weeksBack; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i * 7);
    weekStarts.push(d);
  }

  const buckets = weekStarts.map(() => 0);
  for (const ticket of tickets) {
    for (let i = weekStarts.length - 1; i >= 0; i--) {
      if (ticket.createdAt >= weekStarts[i]) {
        buckets[i] += 1;
        break;
      }
    }
  }

  return weekStarts.map((weekStart, i) => ({
    weekLabel: weekStart.toLocaleDateString("en-CA"),
    count: buckets[i],
  }));
}

// ---------------------------------------------------------------------------
// Network Inventory
// ---------------------------------------------------------------------------

export interface NetworkReportSummary {
  buildingsCount: number;
  distributionPointsCount: number;
  devicesCount: number;
  portsTotal: number;
  portsAssigned: number;
}

export async function getNetworkReportSummary(): Promise<NetworkReportSummary> {
  const [buildingsCount, distributionPointsCount, devicesCount, portsTotal, portsAssigned] =
    await Promise.all([
      prisma.building.count(),
      prisma.distributionPoint.count(),
      prisma.networkDevice.count(),
      prisma.switchPort.count(),
      prisma.networkAssignment.count({
        where: { isCurrent: true, switchPortId: { not: null } },
      }),
    ]);

  return { buildingsCount, distributionPointsCount, devicesCount, portsTotal, portsAssigned };
}

export async function getDevicesByType(): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.networkDevice.groupBy({
    by: ["type"],
    _count: { _all: true },
  });
  return toBreakdown(
    grouped.map((g) => ({ key: g.type, value: g._count._all })),
    NETWORK_DEVICE_TYPE_LABELS,
  );
}

export async function getDevicesByStatus(): Promise<ReportBreakdownItem[]> {
  const grouped = await prisma.networkDevice.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return toBreakdown(
    grouped.map((g) => ({ key: g.status, value: g._count._all })),
    EQUIPMENT_STATUS_LABELS,
  );
}
