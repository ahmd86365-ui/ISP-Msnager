"use client";

import { useActionState, useEffect, useId } from "react";

import { Button } from "@/components/ui/button";
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
import { formatSyp } from "@/lib/format";
import type { SubscriptionFormState } from "@/lib/subscriptions/actions";

export interface PlanOption {
  id: string;
  name: string;
  priceSyp: number;
  downloadMbps: number;
  uploadMbps: number;
  billingPeriod: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
}

const INITIAL_STATE: SubscriptionFormState = {};

export function SubscriptionPlanForm({
  mode,
  plans,
  action,
  onSuccess,
  submitLabel,
}: {
  mode: "create" | "change";
  plans: PlanOption[];
  action: (
    prevState: SubscriptionFormState,
    formData: FormData,
  ) => Promise<SubscriptionFormState>;
  onSuccess?: () => void;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
  // Unique per mounted instance — see PlanForm for why static ids can
  // collide when more than one instance of this form exists in the DOM.
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

      {plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد باقات مفعّلة حالياً. فعّل باقة من صفحة الباقات أولاً.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("planId")}>الباقة</Label>
          <Select name="planId" defaultValue={plans[0]?.id}>
            <SelectTrigger id={fieldId("planId")} className="w-full">
              {/* See PlanForm for why this needs a render-prop: the
                  uncontrolled default value would otherwise render as the
                  raw plan id until the popup is opened once. */}
              <SelectValue placeholder="اختر باقة">
                {(value: string | null) => {
                  const selected = plans.find((plan) => plan.id === value);
                  return selected
                    ? `${selected.name} — ${formatSyp(selected.priceSyp)} / ${BILLING_PERIOD_LABELS[selected.billingPeriod]}`
                    : null;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} — {formatSyp(plan.priceSyp)} /{" "}
                  {BILLING_PERIOD_LABELS[plan.billingPeriod]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.planId && (
            <p className="text-xs text-destructive">{errors.planId[0]}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" rows={3} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending || plans.length === 0} className="mt-2">
        {isPending
          ? "جارٍ الحفظ..."
          : (submitLabel ?? (mode === "create" ? "إنشاء الاشتراك" : "تأكيد"))}
      </Button>
    </form>
  );
}
