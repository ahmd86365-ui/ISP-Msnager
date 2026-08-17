"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteDistributionPointAction } from "@/lib/network/distribution-points/actions";

export function DeleteDistributionPointDialog({
  pointId,
  pointName,
}: {
  pointId: string;
  pointName: string;
}) {
  return (
    <DeleteConfirmDialog
      title="حذف نقطة التوزيع نهائياً؟"
      description={`سيتم حذف "${pointName}" نهائياً من النظام. هذا الإجراء لا يمكن التراجع عنه. إذا كانت هناك أبنية أو أجهزة أو سجلات ربط شبكي مرتبطة بها، سيتم رفض الحذف تلقائياً.`}
      action={() => deleteDistributionPointAction(pointId)}
      triggerLabel="حذف"
    />
  );
}
