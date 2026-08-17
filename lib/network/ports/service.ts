import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

export async function deletePort(portId: string, deviceId: string, actorId: string) {
  const port = await prisma.switchPort.findUniqueOrThrow({ where: { id: portId } });

  const assignmentsCount = await prisma.networkAssignment.count({ where: { switchPortId: portId } });

  const reasons = buildDeleteBlockReasons({
    entityLabel: "هذا المنفذ",
    dependents: [{ count: assignmentsCount, label: "سجل ربط شبكي (حالي أو سابق)" }],
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.switchPort.delete({ where: { id: portId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "PORT_DELETED",
        entityType: "SwitchPort",
        entityId: portId,
        summary: `تم حذف منفذ رقم ${port.portNumber} نهائياً`,
      },
    });
  });

  return deviceId;
}
