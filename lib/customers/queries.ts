import "server-only";

import type { CustomerStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export interface ListCustomersParams {
  search?: string;
  status?: CustomerStatus;
  buildingId?: string;
  page?: number;
}

export async function listCustomers(params: ListCustomersParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.CustomerWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { phone2: { contains: search, mode: "insensitive" } },
      { customerNumber: { contains: search, mode: "insensitive" } },
    ];
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.buildingId) {
    where.buildingId = params.buildingId;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { fullName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { building: { select: { name: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function listBuildingsForSelect() {
  return prisma.building.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      building: {
        include: { distributionPoint: { select: { name: true } } },
      },
    },
  });
}

export async function getCustomerSubscriptionSummary(customerId: string) {
  return prisma.subscription.findFirst({
    where: { customerId },
    orderBy: { startDate: "desc" },
    include: {
      plan: { select: { name: true, downloadMbps: true, uploadMbps: true } },
    },
  });
}

export async function getCustomerNetworkSummary(customerId: string) {
  return prisma.networkAssignment.findFirst({
    where: { customerId, isCurrent: true },
    include: {
      switchPort: { select: { portNumber: true } },
      device: { select: { name: true, type: true } },
      distributionPoint: { select: { name: true } },
    },
  });
}

export async function getCustomerRecentTickets(customerId: string) {
  return prisma.ticket.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      priority: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getCustomerRecentActivity(customerId: string) {
  return prisma.auditLog.findMany({
    where: { entityType: "Customer", entityId: customerId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { actor: { select: { name: true } } },
  });
}
