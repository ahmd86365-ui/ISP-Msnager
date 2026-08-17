"use client";

import { useRouter } from "next/navigation";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { deleteDeviceAction } from "@/lib/network/devices/actions";

export function DeleteDeviceDialog({
  deviceId,
  deviceName,
  redirectTo,
  buttonVariant = "ghost",
  buttonSize = "icon-sm",
  showLabel = false,
}: {
  deviceId: string;
  deviceName: string;
  /** Navigate here after a successful delete (e.g. from the detail page, which no longer exists). */
  redirectTo?: string;
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
}) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      title="حذف الجهاز نهائياً؟"
      description={`سيتم حذف "${deviceName}" نهائياً من النظام مع أي منافذ غير مستخدمة تابعة له. هذا الإجراء لا يمكن التراجع عنه. إذا كان هناك سجل ربط شبكي (حالي أو سابق) مرتبط بالجهاز أو بأحد منافذه، سيتم رفض الحذف تلقائياً.`}
      action={() => deleteDeviceAction(deviceId)}
      onDeleted={redirectTo ? () => router.push(redirectTo) : undefined}
      buttonVariant={buttonVariant}
      buttonSize={buttonSize}
      showLabel={showLabel}
      triggerLabel="حذف"
    />
  );
}
