"use client";

import { useActionState, useEffect, useId, useState } from "react";
import type { TicketCategory, TicketPriority } from "@prisma/client";

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
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_LABELS } from "@/lib/labels";
import type { TicketFormState } from "@/lib/tickets/actions";

export interface CustomerOption {
  id: string;
  fullName: string;
  customerNumber: string;
}

export interface TechnicianOption {
  id: string;
  name: string;
}

const CATEGORIES: TicketCategory[] = [
  "INTERNET_DOWN",
  "SLOW_SPEED",
  "SIGNAL",
  "DEVICE",
  "CABLE",
  "BILLING",
  "INSTALLATION",
  "OTHER",
];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const NO_CUSTOMER_VALUE = "__none__";
const NO_TECHNICIAN_VALUE = "__none__";

const INITIAL_STATE: TicketFormState = {};

type TicketFormActionProps = {
  action: (prevState: TicketFormState, formData: FormData) => Promise<TicketFormState>;
  technicians: TechnicianOption[];
  onSuccess?: () => void;
};

export type TicketFormProps = TicketFormActionProps &
  (
    | { mode: "global"; customers: CustomerOption[] }
    | { mode: "customer"; fixedCustomerId: string }
  );

export function TicketForm(props: TicketFormProps) {
  const { mode, action, technicians, onSuccess } = props;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [customerId, setCustomerId] = useState(NO_CUSTOMER_VALUE);
  const [technicianId, setTechnicianId] = useState(NO_TECHNICIAN_VALUE);

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

      {mode === "global" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("customerId")}>المشترك (اختياري)</Label>
          <Select
            value={customerId}
            onValueChange={(value) => setCustomerId(value ?? NO_CUSTOMER_VALUE)}
          >
            <SelectTrigger id={fieldId("customerId")} className="w-full">
              <SelectValue placeholder="بلاغ شبكة عام">
                {(value: string | null) => {
                  if (!value || value === NO_CUSTOMER_VALUE) {
                    return "بلاغ شبكة عام (بدون مشترك)";
                  }
                  const selected = props.customers.find((c) => c.id === value);
                  return selected
                    ? `${selected.fullName} — ${selected.customerNumber}`
                    : null;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CUSTOMER_VALUE}>بلاغ شبكة عام (بدون مشترك)</SelectItem>
              {props.customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.fullName} — {customer.customerNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="customerId"
            value={customerId === NO_CUSTOMER_VALUE ? "" : customerId}
          />
          {errors.customerId && (
            <p className="text-xs text-destructive">{errors.customerId[0]}</p>
          )}
        </div>
      ) : (
        <input type="hidden" name="customerId" value={props.fixedCustomerId} />
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("title")}>العنوان</Label>
        <Input id={fieldId("title")} name="title" required maxLength={200} />
        {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("description")}>الوصف</Label>
        <Textarea id={fieldId("description")} name="description" rows={4} required />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("category")}>التصنيف</Label>
          <Select name="category" defaultValue="OTHER">
            <SelectTrigger id={fieldId("category")} className="w-full">
              <SelectValue>
                {(value: TicketCategory | null) =>
                  value ? TICKET_CATEGORY_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {TICKET_CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("priority")}>الأولوية</Label>
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger id={fieldId("priority")} className="w-full">
              <SelectValue>
                {(value: TicketPriority | null) =>
                  value ? TICKET_PRIORITY_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {TICKET_PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-xs text-destructive">{errors.priority[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("assignedTechnicianId")}>إسناد إلى (اختياري)</Label>
        <Select
          value={technicianId}
          onValueChange={(value) => setTechnicianId(value ?? NO_TECHNICIAN_VALUE)}
          disabled={technicians.length === 0}
        >
          <SelectTrigger id={fieldId("assignedTechnicianId")} className="w-full">
            <SelectValue>
              {(value: string | null) => {
                if (!value || value === NO_TECHNICIAN_VALUE) return "بدون إسناد";
                const selected = technicians.find((t) => t.id === value);
                return selected ? selected.name : "بدون إسناد";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_TECHNICIAN_VALUE}>بدون إسناد</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="assignedTechnicianId"
          value={technicianId === NO_TECHNICIAN_VALUE ? "" : technicianId}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" rows={3} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : "فتح البلاغ"}
      </Button>
    </form>
  );
}
