import "server-only";

import { prisma } from "@/lib/prisma";

export async function listDistributionPoints() {
  const [points, deviceCounts, buildingCounts] = await Promise.all([
    prisma.distributionPoint.findMany({ orderBy: { name: "asc" } }),
    prisma.networkDevice.groupBy({ by: ["distributionPointId"], _count: { _all: true } }),
    prisma.building.groupBy({ by: ["distributionPointId"], _count: { _all: true } }),
  ]);

  const deviceCountById = new Map(deviceCounts.map((row) => [row.distributionPointId, row._count._all]));
  const buildingCountById = new Map(
    buildingCounts.map((row) => [row.distributionPointId, row._count._all]),
  );

  return points.map((point) => ({
    ...point,
    devicesCount: deviceCountById.get(point.id) ?? 0,
    buildingsCount: buildingCountById.get(point.id) ?? 0,
  }));
}

export async function getDistributionPointById(id: string) {
  return prisma.distributionPoint.findUnique({ where: { id } });
}

export async function listDistributionPointsForSelect() {
  return prisma.distributionPoint.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
}
