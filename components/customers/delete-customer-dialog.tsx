"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteCustomerAction } from "@/lib/customers/actions";

export function DeleteCustomerDialog({
  customerId,
  customerName,
  buttonVariant = "outline",
  buttonSize = "sm",
  showLabel = true,
  redirectTo,
}: {
  customerId: string;
  customerName: string;
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
  /** Navigate here after a successful delete (e.g. from the detail page, which no longer exists). */
  redirectTo?: string;
}) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      title="حذف المشترك نهائياً؟"
      description={`سيتم حذف "${customerName}" نهائياً من النظام. هذا الإجراء لا يمكن التراجع عنه. إذا كان لدى المشترك أي اشتراكات أو دفعات أو سجل شبكي أو تذاكر دعم، سيتم رفض الحذف تلقائياً.`}
      action={() => deleteCustomerAction(customerId)}
      onDeleted={redirectTo ? () => router.push(redirectTo) : undefined}
      buttonVariant={buttonVariant}
      buttonSize={buttonSize}
      showLabel={showLabel}
      triggerLabel="حذف"
    />
  );
}
