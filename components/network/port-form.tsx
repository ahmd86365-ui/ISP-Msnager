"use client";

import { useActionState, useEffect, useId } from "react";
import type { EquipmentStatus, SwitchPort } from "@prisma/client";

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
import { EQUIPMENT_STATUS_LABELS } from "@/lib/labels";
import type { PortFormState } from "@/lib/network/ports/actions";

const INITIAL_STATE: PortFormState = {};

export function PortForm({
  mode,
  port,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  port?: SwitchPort;
  action: (prevState: PortFormState, formData: FormData) => Promise<PortFormState>;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("portNumber")}>رقم المنفذ</Label>
          <Input
            id={fieldId("portNumber")}
            name="portNumber"
            type="number"
            min={1}
            step={1}
            dir="ltr"
            className="text-end"
            defaultValue={port?.portNumber}
            required
          />
          {errors.portNumber && (
            <p className="text-xs text-destructive">{errors.portNumber[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("label")}>تسمية (اختياري)</Label>
          <Input id={fieldId("label")} name="label" defaultValue={port?.label ?? ""} />
          {errors.label && <p className="text-xs text-destructive">{errors.label[0]}</p>}
        </div>

        {mode === "edit" && port && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={fieldId("status")}>الحالة</Label>
            <Select name="status" defaultValue={port.status}>
              <SelectTrigger id={fieldId("status")} className="w-full">
                <SelectValue>
                  {(value: EquipmentStatus | null) =>
                    value ? EQUIPMENT_STATUS_LABELS[value] : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" defaultValue={port?.notes ?? ""} rows={2} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : mode === "create" ? "إضافة المنفذ" : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
