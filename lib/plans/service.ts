import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

export async function deletePlan(planId: string, actorId: string) {
  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } });

  const subscriptionsCount = await prisma.subscription.count({ where: { planId } });

  const reasons = buildDeleteBlockReasons({
    entityLabel: "هذه الباقة",
    dependents: [{ count: subscriptionsCount, label: "اشتراك (حالي أو سابق)" }],
    suggestion: "استخدم خيار التعطيل بدلاً من الحذف للاحتفاظ بسجل الاشتراكات التاريخية.",
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.plan.delete({ where: { id: planId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "PLAN_DELETED",
        entityType: "Plan",
        entityId: planId,
        summary: `تم حذف باقة نهائياً: ${plan.name}`,
      },
    });
  });
}
