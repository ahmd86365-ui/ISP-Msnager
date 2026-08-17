import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

export async function deleteBuilding(buildingId: string, actorId: string) {
  const building = await prisma.building.findUniqueOrThrow({ where: { id: buildingId } });

  const [customersCount, devicesCount] = await Promise.all([
    prisma.customer.count({ where: { buildingId } }),
    prisma.networkDevice.count({ where: { buildingId } }),
  ]);

  const reasons = buildDeleteBlockReasons({
    entityLabel: "هذا البناء",
    dependents: [
      { count: customersCount, label: "مشترك" },
      { count: devicesCount, label: "جهاز شبكة" },
    ],
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.building.delete({ where: { id: buildingId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "BUILDING_DELETED",
        entityType: "Building",
        entityId: buildingId,
        summary: `تم حذف بناء نهائياً: ${building.name}`,
      },
    });
  });
}
