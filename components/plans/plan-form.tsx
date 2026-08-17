"use client";

import { useActionState, useEffect, useId } from "react";
import type { BillingPeriod, Plan } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BILLING_PERIOD_LABELS } from "@/lib/labels";
import type { PlanFormState } from "@/lib/plans/actions";

const INITIAL_STATE: PlanFormState = {};

export function PlanForm({
  mode,
  plan,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  plan?: Plan;
  action: (prevState: PlanFormState, formData: FormData) => Promise<PlanFormState>;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
  // Unique per mounted form instance: the Add and Edit dialogs can both have
  // rendered a PlanForm within the same page session, and static ids would
  // collide across those two instances (Base UI's Select then reports a
  // "changing default value" warning because it associates state by id).
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
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
        <Label htmlFor={fieldId("name")}>اسم الباقة</Label>
        <Input id={fieldId("name")} name="name" defaultValue={plan?.name} required />
        {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("downloadMbps")}>سرعة التحميل (Mbps)</Label>
          <Input
            id={fieldId("downloadMbps")}
            name="downloadMbps"
            type="number"
            min={1}
            step={1}
            dir="ltr"
            className="text-end"
            defaultValue={plan?.downloadMbps}
            required
          />
          {errors.downloadMbps && (
            <p className="text-xs text-destructive">{errors.downloadMbps[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("uploadMbps")}>سرعة الرفع (Mbps)</Label>
          <Input
            id={fieldId("uploadMbps")}
            name="uploadMbps"
            type="number"
            min={1}
            step={1}
            dir="ltr"
            className="text-end"
            defaultValue={plan?.uploadMbps}
            required
          />
          {errors.uploadMbps && (
            <p className="text-xs text-destructive">{errors.uploadMbps[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("priceSyp")}>السعر (ل.س)</Label>
          <Input
            id={fieldId("priceSyp")}
            name="priceSyp"
            type="number"
            min={1}
            step={1}
            dir="ltr"
            className="text-end"
            defaultValue={plan?.priceSyp}
            required
          />
          {errors.priceSyp && (
            <p className="text-xs text-destructive">{errors.priceSyp[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("billingPeriod")}>دورة الفوترة</Label>
          <Select name="billingPeriod" defaultValue={plan?.billingPeriod ?? "MONTHLY"}>
            <SelectTrigger id={fieldId("billingPeriod")} className="w-full">
              {/* Base UI's SelectValue can only resolve a label from a
                  matching <SelectItem>, and item content isn't mounted
                  until the popup has been opened at least once — so an
                  uncontrolled default value would otherwise render as the
                  raw enum string ("MONTHLY") until the user opens it. */}
              <SelectValue>
                {(value: BillingPeriod | null) =>
                  value ? BILLING_PERIOD_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BILLING_PERIOD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.billingPeriod && (
            <p className="text-xs text-destructive">{errors.billingPeriod[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("description")}>الوصف (اختياري)</Label>
        <Textarea
          id={fieldId("description")}
          name="description"
          defaultValue={plan?.description ?? ""}
          rows={3}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "جارٍ الحفظ..."
          : mode === "create"
            ? "إضافة الباقة"
            : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
