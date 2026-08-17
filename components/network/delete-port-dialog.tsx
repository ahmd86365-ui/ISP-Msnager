"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deletePortAction } from "@/lib/network/ports/actions";

export function DeletePortDialog({
  deviceId,
  portId,
  portNumber,
}: {
  deviceId: string;
  portId: string;
  portNumber: number;
}) {
  return (
    <DeleteConfirmDialog
      title="حذف المنفذ نهائياً؟"
      description={`سيتم حذف المنفذ رقم ${portNumber} نهائياً من هذا الجهاز. هذا الإجراء لا يمكن التراجع عنه. إذا كان هناك سجل ربط شبكي (حالي أو سابق) مرتبط بهذا المنفذ، سيتم رفض الحذف تلقائياً.`}
      action={() => deletePortAction(deviceId, portId)}
      triggerLabel="حذف"
    />
  );
}
