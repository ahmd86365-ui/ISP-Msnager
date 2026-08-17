import "server-only";

import { prisma } from "@/lib/prisma";

export async function listPlans() {
  const [plans, activeCounts] = await Promise.all([
    prisma.plan.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.subscription.groupBy({
      by: ["planId"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);

  const countByPlanId = new Map(
    activeCounts.map((row) => [row.planId, row._count._all]),
  );

  return plans.map((plan) => ({
    ...plan,
    activeSubscribersCount: countByPlanId.get(plan.id) ?? 0,
  }));
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({ where: { id } });
}

// All plans (active or not) for filter dropdowns — historical subscriptions
// can reference a plan that has since been deactivated.
export async function listAllPlansForFilter() {
  return prisma.plan.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listActivePlansForSelect() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      priceSyp: true,
      downloadMbps: true,
      uploadMbps: true,
      billingPeriod: true,
    },
  });
}
