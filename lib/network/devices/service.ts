import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

// A device can be deleted only when no NetworkAssignment history points to
// it — neither directly (deviceId) nor through one of its ports
// (switchPortId). If there's no assignment history at all, any ports it
// has are guaranteed to be unused too (SwitchPort.networkAssignments would
// otherwise be non-empty) and are safely removed along with it via the
// schema's ON DELETE CASCADE from SwitchPort to NetworkDevice.
export async function deleteDevice(deviceId: string, actorId: string) {
  const device = await prisma.networkDevice.findUniqueOrThrow({ where: { id: deviceId } });

  const [directAssignmentsCount, portAssignmentsCount, portsCount] = await Promise.all([
    prisma.networkAssignment.count({ where: { deviceId } }),
    prisma.networkAssignment.count({ where: { switchPort: { deviceId } } }),
    prisma.switchPort.count({ where: { deviceId } }),
  ]);
  const assignmentsCount = directAssignmentsCount + portAssignmentsCount;

  const reasons = buildDeleteBlockReasons({
    entityLabel: "هذا الجهاز",
    dependents: [{ count: assignmentsCount, label: "سجل ربط شبكي (حالي أو سابق)" }],
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.networkDevice.delete({ where: { id: deviceId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "DEVICE_DELETED",
        entityType: "NetworkDevice",
        entityId: deviceId,
        summary:
          portsCount > 0
            ? `تم حذف جهاز نهائياً مع ${portsCount} منفذ غير مستخدم: ${device.name}`
            : `تم حذف جهاز نهائياً: ${device.name}`,
      },
    });
  });
}
