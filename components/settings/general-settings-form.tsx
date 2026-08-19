"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAppSettingsAction, type SettingsFormState } from "@/lib/settings/actions";

const INITIAL_STATE: SettingsFormState = {};

export function GeneralSettingsForm({
  settings,
}: {
  settings: { businessName: string; currency: string; timezone: string };
}) {
  const [state, formAction, isPending] = useActionState(updateAppSettingsAction, INITIAL_STATE);
  const errors = state.errors ?? {};

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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="businessName">اسم المنشأة</Label>
          <Input
            id="businessName"
            name="businessName"
            defaultValue={settings.businessName}
            required
          />
          {errors.businessName && (
            <p className="text-xs text-destructive">{errors.businessName[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">رمز العملة</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={settings.currency}
            required
            dir="ltr"
          />
          {errors.currency && (
            <p className="text-xs text-destructive">{errors.currency[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timezone">المنطقة الزمنية</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={settings.timezone}
            required
            dir="ltr"
          />
          {errors.timezone && (
            <p className="text-xs text-destructive">{errors.timezone[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </Button>
        {state.ok && !isPending && (
          <p className="text-sm text-status-good">تم الحفظ بنجاح.</p>
        )}
      </div>
    </form>
  );
}
