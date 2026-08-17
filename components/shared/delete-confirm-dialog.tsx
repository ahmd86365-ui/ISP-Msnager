"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DeleteActionResult {
  ok?: boolean;
  error?: string;
}

export function DeleteConfirmDialog({
  title,
  description,
  action,
  onDeleted,
  buttonVariant = "ghost",
  buttonSize = "icon-sm",
  showLabel = false,
  triggerLabel = "حذف",
}: {
  title: string;
  description: string;
  action: () => Promise<DeleteActionResult>;
  onDeleted?: () => void;
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setOpen(false);
        onDeleted?.();
      } else {
        setError(result.error ?? "حدث خطأ أثناء الحذف. حاول مرة أخرى.");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setError(null);
      }}
    >
      <Button variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
        {showLabel ? triggerLabel : <span className="sr-only">{triggerLabel}</span>}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
            تراجع
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
