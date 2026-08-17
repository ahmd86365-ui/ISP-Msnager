"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteBuildingAction } from "@/lib/network/buildings/actions";

export function DeleteBuildingDialog({
  buildingId,
  buildingName,
}: {
  buildingId: string;
  buildingName: string;
}) {
  return (
    <DeleteConfirmDialog
      title="حذف البناء نهائياً؟"
      description={`سيتم حذف "${buildingName}" نهائياً من النظام. هذا الإجراء لا يمكن التراجع عنه. إذا كان هناك مشتركون أو أجهزة شبكة مرتبطون بهذا البناء، سيتم رفض الحذف تلقائياً.`}
      action={() => deleteBuildingAction(buildingId)}
      triggerLabel="حذف"
    />
  );
}
