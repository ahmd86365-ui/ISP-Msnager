"use client";

import { useActionState, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetPasswordAction, type UserFormState } from "@/lib/users/actions";

const INITIAL_STATE: UserFormState = {};

function ResetPasswordForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const boundAction = resetPasswordAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      onSuccess();
    }
    // onSuccess is expected to be a stable callback from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {errors._form && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors._form[0]}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">كلمة المرور الجديدة</Label>
        <Input id="password" name="password" type="password" required dir="ltr" />
        {errors.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required dir="ltr" />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : "تعيين كلمة المرور"}
      </Button>
    </form>
  );
}

export function ResetPasswordDialog({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <KeyRound className="size-4" />
        <span className="sr-only">إعادة تعيين كلمة المرور</span>
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription>
            سيتم تعيين كلمة مرور جديدة لحساب &quot;{userName}&quot; فوراً.
          </DialogDescription>
        </DialogHeader>
        <ResetPasswordForm userId={userId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
