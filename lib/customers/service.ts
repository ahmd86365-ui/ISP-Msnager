import "server-only";

import { prisma } from "@/lib/prisma";
import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

// A customer can be hard-deleted only when nothing references them at
// all — not just active records, but any historical ones too, since a
// subscription/payment/network assignment/ticket that outlives the
// customer it describes would be meaningless. Archiving (status=ARCHIVED)
// remains the correct action for a customer with any history; this delete
// is only for a customer that was created by mistake and never had any
// activity.
export async function deleteCustomer(customerId: string, actorId: string) {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  const [subscriptionsCount, paymentsCount, networkAssignmentsCount, ticketsCount] =
    await Promise.all([
      prisma.subscription.count({ where: { customerId } }),
      prisma.payment.count({ where: { customerId } }),
      prisma.networkAssignment.count({ where: { customerId } }),
      prisma.ticket.count({ where: { customerId } }),
    ]);

  const reasons = buildDeleteBlockReasons({
    entityLabel: "هذا المشترك",
    dependents: [
      { count: subscriptionsCount, label: "اشتراك" },
      { count: paymentsCount, label: "دفعة" },
      { count: networkAssignmentsCount, label: "سجل ربط شبكي" },
      { count: ticketsCount, label: "تذكرة دعم" },
    ],
    suggestion:
      "استخدم خيار الأرشفة للاحتفاظ بالبيانات وإخفاء المشترك من القوائم النشطة بدلاً من الحذف.",
  });
  if (reasons.length > 0) {
    throw new DeleteBlockedError(reasons);
  }

  await prisma.$transaction(async (tx) => {
    await tx.customer.delete({ where: { id: customerId } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "CUSTOMER_DELETED",
        entityType: "Customer",
        entityId: customerId,
        summary: `تم حذف المشترك نهائياً: ${customer.fullName} (${customer.customerNumber})`,
      },
    });
  });
}
