import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ListBuildingsParams {
  search?: string;
  distributionPointId?: string;
}

export async function listBuildings(params: ListBuildingsParams = {}) {
  const where: Prisma.BuildingWhereInput = {};
  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { area: { contains: search, mode: "insensitive" } },
    ];
  }
  if (params.distributionPointId) {
    where.distributionPointId = params.distributionPointId;
  }

  const [buildings, customerCounts] = await Promise.all([
    prisma.building.findMany({
      where,
      orderBy: { name: "asc" },
      include: { distributionPoint: { select: { name: true } } },
    }),
    prisma.customer.groupBy({ by: ["buildingId"], _count: { _all: true } }),
  ]);

  const customerCountById = new Map(customerCounts.map((row) => [row.buildingId, row._count._all]));

  return buildings.map((building) => ({
    ...building,
    customersCount: customerCountById.get(building.id) ?? 0,
  }));
}

export async function getBuildingById(id: string) {
  return prisma.building.findUnique({
    where: { id },
    include: { distributionPoint: { select: { name: true } } },
  });
}
