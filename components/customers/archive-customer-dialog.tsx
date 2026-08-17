"use client";

import { useState, useTransition } from "react";
import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { archiveCustomerAction } from "@/lib/customers/actions";

export function ArchiveCustomerDialog({
  customerId,
  customerName,
  buttonVariant = "outline",
  buttonSize = "sm",
  showLabel = true,
}: {
  customerId: string;
  customerName: string;
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await archiveCustomerAction(customerId);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        <Archive className="size-4" />
        {showLabel && "أرشفة"}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>أرشفة المشترك؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم أرشفة &quot;{customerName}&quot;. يمكن الوصول إلى بياناته
            لاحقاً، لكنه لن يظهر ضمن المشتركين النشطين. هذا الإجراء لا يحذف أي
            بيانات.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "جارٍ الأرشفة..." : "تأكيد الأرشفة"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
