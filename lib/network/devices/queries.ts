import "server-only";

import type { EquipmentStatus, NetworkDeviceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export interface ListDevicesParams {
  search?: string;
  type?: NetworkDeviceType;
  status?: EquipmentStatus;
  distributionPointId?: string;
  page?: number;
}

export async function listDevices(params: ListDevicesParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.NetworkDeviceWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { hostname: { contains: search, mode: "insensitive" } },
      { vendor: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
      { mac: { contains: search, mode: "insensitive" } },
      { managementIp: { contains: search, mode: "insensitive" } },
    ];
  }
  if (params.type) {
    where.type = params.type;
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.distributionPointId) {
    where.distributionPointId = params.distributionPointId;
  }

  const [devices, total] = await Promise.all([
    prisma.networkDevice.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        distributionPoint: { select: { name: true } },
        building: { select: { name: true } },
        _count: { select: { ports: true } },
      },
    }),
    prisma.networkDevice.count({ where }),
  ]);

  return {
    devices,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getDeviceById(id: string) {
  return prisma.networkDevice.findUnique({
    where: { id },
    include: {
      distributionPoint: { select: { id: true, name: true } },
      building: { select: { id: true, name: true } },
      ports: {
        orderBy: { portNumber: "asc" },
        include: {
          networkAssignments: {
            where: { isCurrent: true },
            take: 1,
            select: {
              customer: { select: { id: true, fullName: true, customerNumber: true } },
            },
          },
        },
      },
    },
  });
}

// Feeds the device select on the Building form and the cascading
// distribution-point -> device select in the network-assignment dialog.
export async function listDevicesForSelect(distributionPointId?: string) {
  return prisma.networkDevice.findMany({
    where: distributionPointId ? { distributionPointId } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true, distributionPointId: true },
  });
}
