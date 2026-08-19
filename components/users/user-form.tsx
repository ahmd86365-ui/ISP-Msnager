"use client";

import { useActionState, useEffect } from "react";
import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/labels";
import type { UserFormState } from "@/lib/users/actions";

const ALL_ROLES: Role[] = ["OWNER", "ADMIN", "ACCOUNTANT", "SUPPORT", "TECHNICIAN"];

const INITIAL_STATE: UserFormState = {};

export function UserForm({
  mode,
  user,
  canAssignOwner,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  user?: { name: string; username: string; role: Role };
  canAssignOwner: boolean;
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
    // onSuccess is expected to be a stable callback from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  const assignableRoles = ALL_ROLES.filter((role) => role !== "OWNER" || canAssignOwner);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">الاسم الكامل</Label>
          <Input id="name" name="name" defaultValue={user?.name} required />
          {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">اسم المستخدم</Label>
          <Input
            id="username"
            name="username"
            defaultValue={user?.username}
            required
            dir="ltr"
            className="text-end"
          />
          {errors.username && (
            <p className="text-xs text-destructive">{errors.username[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">الدور</Label>
          <Select name="role" defaultValue={user?.role ?? "SUPPORT"}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-xs text-destructive">{errors.role[0]}</p>}
        </div>

        {mode === "create" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" name="password" type="password" required dir="ltr" />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password[0]}</p>
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "جارٍ الحفظ..."
          : mode === "create"
            ? "إضافة المستخدم"
            : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
