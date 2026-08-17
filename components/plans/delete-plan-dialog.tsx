"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deletePlanAction } from "@/lib/plans/actions";

export function DeletePlanDialog({ planId, planName }: { planId: string; planName: string }) {
  return (
    <DeleteConfirmDialog
      title="حذف الباقة نهائياً؟"
      description={`سيتم حذف "${planName}" نهائياً من النظام. هذا الإجراء لا يمكن التراجع عنه. إذا كان هناك أي اشتراكات (حالية أو سابقة) مرتبطة بهذه الباقة، سيتم رفض الحذف تلقائياً وسيُقترح عليك استخدام التعطيل بدلاً من ذلك.`}
      action={() => deletePlanAction(planId)}
      triggerLabel="حذف"
    />
  );
}
