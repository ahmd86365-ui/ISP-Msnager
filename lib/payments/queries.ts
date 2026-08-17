import "server-only";

import type { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const RECENT_PAYMENTS_LIMIT = 5;

export interface ListPaymentsParams {
  search?: string;
  method?: PaymentMethod;
  isVoided?: boolean;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export async function listPayments(params: ListPaymentsParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.PaymentWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
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
  if (params.method) {
    where.method = params.method;
  }
  if (params.isVoided !== undefined) {
    where.isVoided = params.isVoided;
  }
  if (params.customerId) {
    where.customerId = params.customerId;
  }
  if (params.dateFrom || params.dateTo) {
    where.paidAt = {};
    if (params.dateFrom) {
      where.paidAt.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      // Treat the "to" date as inclusive of the whole day.
      const to = new Date(params.dateTo);
      to.setDate(to.getDate() + 1);
      where.paidAt.lt = to;
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: {
          select: { id: true, fullName: true, customerNumber: true, phone: true },
        },
        subscription: { select: { id: true, plan: { select: { name: true } } } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getCustomerRecentPayments(customerId: string) {
  return prisma.payment.findMany({
    where: { customerId },
    orderBy: { paidAt: "desc" },
    take: RECENT_PAYMENTS_LIMIT,
    include: {
      subscription: { select: { plan: { select: { name: true } } } },
    },
  });
}

export async function getCustomerPaymentsTotal(customerId: string) {
  const result = await prisma.payment.aggregate({
    _sum: { amountSyp: true },
    where: { customerId, isVoided: false },
  });
  return result._sum.amountSyp ?? 0;
}

// Feeds the "add payment" dialog's customer -> subscription cascading
// select. Kept intentionally simple (one query, no pagination) — sized for
// this ISP's realistic customer count, not a large multi-tenant directory.
export async function listCustomersWithSubscriptionsForPaymentForm() {
  return prisma.customer.findMany({
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      customerNumber: true,
      subscriptions: {
        orderBy: { startDate: "desc" },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          priceAtSubscriptionSyp: true,
          plan: { select: { name: true } },
        },
      },
    },
  });
}
