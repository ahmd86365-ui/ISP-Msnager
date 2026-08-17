import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

export async function deleteDistributionPoint(pointId: string, actorId: string) {
  const point = await prisma.distributionPoint.findUniqueOrThrow({ where: { id: pointId } });

  const [buildingsCount, devicesCount, assignmentsCount] = await Promise.all([
    prisma.building.count({ where: { distributionPointId: pointId } }),
    prisma.networkDevice.count({ where: { distributionPointId: pointId } }),
    prisma.networkAssignment.count({ where: { distributionPointId: pointId } }),
  ]);

  const reasons = buildDeleteBlockReasons({
    entityLabel: "نقطة التوزيع هذه",
    dependents: [
      { count: buildingsCount, label: "بناء" },
      { count: devicesCount, label: "جهاز شبكة" },
      { count: assignmentsCount, label: "سجل ربط شبكي" },
    ],
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.distributionPoint.delete({ where: { id: pointId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "DISTRIBUTION_POINT_DELETED",
        entityType: "DistributionPoint",
        entityId: pointId,
        summary: `تم حذف نقطة توزيع نهائياً: ${point.name} (${point.code})`,
      },
    });
  });
}
