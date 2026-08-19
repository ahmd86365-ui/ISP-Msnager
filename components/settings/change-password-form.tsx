"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeOwnPasswordAction } from "@/lib/users/actions";
import type { UserFormState } from "@/lib/users/actions";

const INITIAL_STATE: UserFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changeOwnPasswordAction, INITIAL_STATE);
  const errors = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {errors._form && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors._form[0]}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            dir="ltr"
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">{errors.currentPassword[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
          <Input id="newPassword" name="newPassword" type="password" required dir="ltr" />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            dir="ltr"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
        </Button>
        {state.ok && !isPending && (
          <p className="text-sm text-status-good">تم تغيير كلمة المرور بنجاح.</p>
        )}
      </div>
    </form>
  );
}
