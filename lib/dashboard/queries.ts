import "server-only";

import type { TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Dashboard-only read aggregates. These are intentionally simple, page-scoped
// queries against existing tables — not a Customer/Subscription/Payment
// service layer. Real business rules (e.g. FIFO balance allocation, what
// "current" subscriber status means) belong to those future modules; see
// the Step 4 report for exactly what each query here does and does not do.

const OPEN_TICKET_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING"];

export async function getDashboardSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfYesterday = new Date(now);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const [
    totalCustomers,
    newCustomersThisMonth,
    paymentsThisMonth,
    paymentsLastMonth,
    openTicketsCount,
    newOpenTicketsSinceYesterday,
    subscriptionTotals,
    paidTotals,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({
      _sum: { amountSyp: true },
      where: { isVoided: false, paidAt: { gte: startOfMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amountSyp: true },
      where: {
        isVoided: false,
        paidAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.ticket.count({ where: { status: { in: OPEN_TICKET_STATUSES } } }),
    prisma.ticket.count({
      where: {
        status: { in: OPEN_TICKET_STATUSES },
        createdAt: { gte: startOfYesterday },
      },
    }),
    prisma.subscription.aggregate({ _sum: { priceAtSubscriptionSyp: true } }),
    prisma.payment.aggregate({
      _sum: { amountSyp: true },
      where: { isVoided: false },
    }),
  ]);

  const paymentsThisMonthTotal = paymentsThisMonth._sum.amountSyp ?? 0;
  const paymentsLastMonthTotal = paymentsLastMonth._sum.amountSyp ?? 0;
  const paymentsMonthOverMonthPct =
    paymentsLastMonthTotal > 0
      ? Math.round(
          ((paymentsThisMonthTotal - paymentsLastMonthTotal) /
            paymentsLastMonthTotal) *
            100,
        )
      : null;

  // Simple aggregate approximation (total charged across all subscriptions
  // minus total collected across all payments) — not the per-customer FIFO
  // balance agreed for the future Payments service layer. Good enough for a
  // single headline number; not accurate per-customer debt.
  const totalCharged = subscriptionTotals._sum.priceAtSubscriptionSyp ?? 0;
  const totalPaid = paidTotals._sum.amountSyp ?? 0;
  const totalOutstanding = Math.max(0, totalCharged - totalPaid);

  return {
    totalCustomers,
    newCustomersThisMonth,
    paymentsThisMonthTotal,
    paymentsMonthOverMonthPct,
    totalOutstanding,
    openTicketsCount,
    newOpenTicketsSinceYesterday,
  };
}

export async function getSubscriptionStatusBreakdown() {
  const grouped = await prisma.subscription.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all]),
  );

  return {
    active: counts.ACTIVE ?? 0,
    suspended: counts.SUSPENDED ?? 0,
    expired: counts.EXPIRED ?? 0,
  };
}

export interface PopularPlan {
  planId: string;
  name: string;
  count: number;
  percentage: number;
}

// Counts currently-ACTIVE subscriptions per plan — a single flat filter, not
// a "current customer status" derivation.
export async function getPopularPlans(): Promise<PopularPlan[]> {
  const grouped = await prisma.subscription.groupBy({
    by: ["planId"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });

  if (grouped.length === 0) {
    return [];
  }

  const plans = await prisma.plan.findMany({
    where: { id: { in: grouped.map((g) => g.planId) } },
    select: { id: true, name: true },
  });
  const totalActive = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return grouped
    .map((g) => {
      const plan = plans.find((p) => p.id === g.planId);
      return {
        planId: g.planId,
        name: plan?.name ?? "باقة غير معروفة",
        count: g._count._all,
        percentage:
          totalActive > 0 ? Math.round((g._count._all / totalActive) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export async function getRecentOpenTickets() {
  return prisma.ticket.findMany({
    where: { status: { in: OPEN_TICKET_STATUSES } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      status: true,
      createdAt: true,
      customer: { select: { fullName: true } },
    },
  });
}
