"use client";

import { useActionState, useEffect, useId, useState } from "react";
import type { PaymentMethod, SubscriptionStatus } from "@prisma/client";

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
import { PAYMENT_METHOD_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/labels";
import { formatSyp } from "@/lib/format";
import type { PaymentFormState } from "@/lib/payments/actions";

export interface SubscriptionOption {
  id: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  priceAtSubscriptionSyp: number;
  plan: { name: string };
}

export interface CustomerOption {
  id: string;
  fullName: string;
  customerNumber: string;
  subscriptions: SubscriptionOption[];
}

const INITIAL_STATE: PaymentFormState = {};
const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "TRANSFER", "WALLET", "OTHER"];
const NO_SUBSCRIPTION_VALUE = "__none__";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function subscriptionLabel(subscription: SubscriptionOption) {
  return `${subscription.plan.name} — ${formatSyp(subscription.priceAtSubscriptionSyp)} (${SUBSCRIPTION_STATUS_LABELS[subscription.status]})`;
}

function SubscriptionSelect({
  fieldId,
  subscriptions,
}: {
  fieldId: string;
  subscriptions: SubscriptionOption[];
}) {
  const [value, setValue] = useState(NO_SUBSCRIPTION_VALUE);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>الاشتراك المرتبط (اختياري)</Label>
      <Select
        value={value}
        onValueChange={(next) => setValue(next ?? NO_SUBSCRIPTION_VALUE)}
        disabled={subscriptions.length === 0}
      >
        <SelectTrigger id={fieldId} className="w-full">
          <SelectValue>
            {(current: string | null) => {
              if (!current || current === NO_SUBSCRIPTION_VALUE) {
                return "بدون اشتراك محدد";
              }
              const selected = subscriptions.find((s) => s.id === current);
              return selected ? subscriptionLabel(selected) : "بدون اشتراك محدد";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SUBSCRIPTION_VALUE}>بدون اشتراك محدد</SelectItem>
          {subscriptions.map((subscription) => (
            <SelectItem key={subscription.id} value={subscription.id}>
              {subscriptionLabel(subscription)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* The Select above manages its own display value ("بدون اشتراك محدد"
          isn't a real id); submit the real subscriptionId (or nothing)
          via a plain hidden input so the server action's FormData stays
          simple regardless of which Select value is "empty". */}
      <input
        type="hidden"
        name="subscriptionId"
        value={value === NO_SUBSCRIPTION_VALUE ? "" : value}
      />
    </div>
  );
}

type PaymentFormActionProps = {
  action: (
    prevState: PaymentFormState,
    formData: FormData,
  ) => Promise<PaymentFormState>;
  onSuccess?: () => void;
};

export type PaymentFormProps = PaymentFormActionProps &
  (
    | { mode: "global"; customers: CustomerOption[] }
    | { mode: "customer"; fixedCustomerId: string; subscriptions: SubscriptionOption[] }
  );

export function PaymentForm(props: PaymentFormProps) {
  const { mode, action, onSuccess } = props;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    mode === "global" ? (props.customers[0]?.id ?? "") : props.fixedCustomerId,
  );

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
    // onSuccess is expected to be a stable callback from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  const activeSubscriptions =
    mode === "customer"
      ? props.subscriptions
      : (props.customers.find((c) => c.id === selectedCustomerId)?.subscriptions ?? []);

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

      {mode === "global" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("customerId")}>المشترك</Label>
          <Select
            name="customerId"
            value={selectedCustomerId}
            onValueChange={(value) => setSelectedCustomerId(value ?? "")}
          >
            <SelectTrigger id={fieldId("customerId")} className="w-full">
              <SelectValue placeholder="اختر مشتركاً">
                {(value: string | null) => {
                  const selected = props.customers.find((c) => c.id === value);
                  return selected
                    ? `${selected.fullName} — ${selected.customerNumber}`
                    : null;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {props.customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.fullName} — {customer.customerNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customerId && (
            <p className="text-xs text-destructive">{errors.customerId[0]}</p>
          )}
        </div>
      ) : (
        <input type="hidden" name="customerId" value={props.fixedCustomerId} />
      )}

      <SubscriptionSelect
        key={selectedCustomerId}
        fieldId={fieldId("subscriptionId")}
        subscriptions={activeSubscriptions}
      />
      {errors.subscriptionId && (
        <p className="-mt-2 text-xs text-destructive">{errors.subscriptionId[0]}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("amountSyp")}>المبلغ (ل.س)</Label>
          <Input
            id={fieldId("amountSyp")}
            name="amountSyp"
            type="number"
            min={1}
            step={1}
            dir="ltr"
            className="text-end"
            required
          />
          {errors.amountSyp && (
            <p className="text-xs text-destructive">{errors.amountSyp[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("method")}>طريقة الدفع</Label>
          <Select name="method" defaultValue="CASH">
            <SelectTrigger id={fieldId("method")} className="w-full">
              <SelectValue>
                {(value: PaymentMethod | null) =>
                  value ? PAYMENT_METHOD_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.method && (
            <p className="text-xs text-destructive">{errors.method[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("paidAt")}>تاريخ الدفع</Label>
          <Input
            id={fieldId("paidAt")}
            name="paidAt"
            type="date"
            defaultValue={todayInputValue()}
            required
          />
          {errors.paidAt && (
            <p className="text-xs text-destructive">{errors.paidAt[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("reference")}>رقم مرجعي (اختياري)</Label>
          <Input id={fieldId("reference")} name="reference" dir="ltr" className="text-end" />
          {errors.reference && (
            <p className="text-xs text-destructive">{errors.reference[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" rows={3} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : "تسجيل الدفعة"}
      </Button>
    </form>
  );
}
