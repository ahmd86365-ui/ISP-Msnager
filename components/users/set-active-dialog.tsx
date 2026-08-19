"use client";

import { useState, useTransition } from "react";
import { UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setUserActiveAction } from "@/lib/users/actions";

export function SetActiveDialog({
  userId,
  userName,
  isActive,
}: {
  userId: string;
  userName: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await setUserActiveAction(userId, !isActive);
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.error ?? "حدث خطأ. حاول مرة أخرى.");
      }
    });
  }

  const Icon = isActive ? UserX : UserCheck;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setError(null);
      }}
    >
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Icon className="size-4" />
        <span className="sr-only">{isActive ? "إلغاء التفعيل" : "تفعيل"}</span>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "إلغاء تفعيل المستخدم؟" : "تفعيل المستخدم؟"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? `لن يتمكن "${userName}" من تسجيل الدخول بعد إلغاء التفعيل. يمكن إعادة تفعيل الحساب لاحقاً في أي وقت.`
              : `سيتمكن "${userName}" من تسجيل الدخول مجدداً.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className={
              isActive ? "bg-destructive text-white hover:bg-destructive/90" : undefined
            }
          >
            {isPending
              ? "جارٍ التنفيذ..."
              : isActive
                ? "تأكيد إلغاء التفعيل"
                : "تأكيد التفعيل"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
