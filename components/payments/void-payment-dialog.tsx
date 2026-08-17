"use client";

import { useId, useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { voidPaymentAction } from "@/lib/payments/actions";
import { formatSyp } from "@/lib/format";

export function VoidPaymentDialog({
  paymentId,
  amountSyp,
}: {
  paymentId: string;
  amountSyp: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const uid = useId();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await voidPaymentAction(paymentId, {}, formData);
      if (result.ok) {
        setOpen(false);
      } else {
        setFormError(result.errors?._form?.[0] ?? "حدث خطأ أثناء إلغاء الدفعة.");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setFormError(null);
      }}
    >
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Ban className="size-4" />
        <span className="sr-only">إلغاء الدفعة</span>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>إلغاء الدفعة؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم إلغاء دفعة بقيمة {formatSyp(amountSyp)}. تبقى الدفعة ظاهرة في
            السجل بحالة &quot;ملغاة&quot; ولا تُحذف، ولن تُحتسب ضمن إجمالي
            المدفوعات بعد الإلغاء.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-voidReason`}>سبب الإلغاء (اختياري)</Label>
            <Textarea id={`${uid}-voidReason`} name="voidReason" rows={2} />
          </div>

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
              type="submit"
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "جارٍ الإلغاء..." : "تأكيد الإلغاء"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
