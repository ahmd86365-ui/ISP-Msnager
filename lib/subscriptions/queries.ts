import "server-only";

import type { Prisma, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export interface ListSubscriptionsParams {
  search?: string;
  status?: SubscriptionStatus;
  planId?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
}

export async function listSubscriptions(params: ListSubscriptionsParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.SubscriptionWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.customer = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { customerNumber: { contains: search, mode: "insensitive" } },
      ],
    };
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.planId) {
    where.planId = params.planId;
  }
  if (params.endDateFrom || params.endDateTo) {
    where.endDate = {};
    if (params.endDateFrom) {
      where.endDate.gte = new Date(params.endDateFrom);
    }
    if (params.endDateTo) {
      // Treat the "to" date as inclusive of the whole day.
      const to = new Date(params.endDateTo);
      to.setDate(to.getDate() + 1);
      where.endDate.lt = to;
    }
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: {
          select: { id: true, fullName: true, customerNumber: true, phone: true },
        },
        plan: { select: { id: true, name: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    subscriptions,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getSubscriptionById(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          customerNumber: true,
          phone: true,
          status: true,
        },
      },
      plan: true,
    },
  });
}

export async function getCustomerSubscriptionHistory(
  customerId: string,
  excludeId?: string,
) {
  return prisma.subscription.findMany({
    where: {
      customerId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { startDate: "desc" },
    include: { plan: { select: { name: true } } },
  });
}
