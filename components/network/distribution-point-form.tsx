"use client";

import { useActionState, useEffect, useId } from "react";
import type { DistributionPoint, EquipmentStatus } from "@prisma/client";

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
import type { DistributionPointFormState } from "@/lib/network/distribution-points/actions";

const INITIAL_STATE: DistributionPointFormState = {};

export function DistributionPointForm({
  mode,
  point,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  point?: DistributionPoint;
  action: (
    prevState: DistributionPointFormState,
    formData: FormData,
  ) => Promise<DistributionPointFormState>;
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
          <Label htmlFor={fieldId("name")}>اسم نقطة التوزيع</Label>
          <Input id={fieldId("name")} name="name" defaultValue={point?.name} required />
          {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("code")}>الرمز</Label>
          <Input
            id={fieldId("code")}
            name="code"
            defaultValue={point?.code}
            dir="ltr"
            className="text-end"
            required
          />
          {errors.code && <p className="text-xs text-destructive">{errors.code[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("area")}>المنطقة</Label>
          <Input id={fieldId("area")} name="area" defaultValue={point?.area} required />
          {errors.area && <p className="text-xs text-destructive">{errors.area[0]}</p>}
        </div>

        {mode === "edit" && point && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={fieldId("status")}>الحالة</Label>
            <Select name="status" defaultValue={point.status}>
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("lat")}>خط العرض (اختياري)</Label>
          <Input
            id={fieldId("lat")}
            name="lat"
            type="number"
            step="any"
            dir="ltr"
            className="text-end"
            defaultValue={point?.lat ?? ""}
          />
          {errors.lat && <p className="text-xs text-destructive">{errors.lat[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("lng")}>خط الطول (اختياري)</Label>
          <Input
            id={fieldId("lng")}
            name="lng"
            type="number"
            step="any"
            dir="ltr"
            className="text-end"
            defaultValue={point?.lng ?? ""}
          />
          {errors.lng && <p className="text-xs text-destructive">{errors.lng[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("description")}>الوصف (اختياري)</Label>
        <Textarea
          id={fieldId("description")}
          name="description"
          defaultValue={point?.description ?? ""}
          rows={2}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" defaultValue={point?.notes ?? ""} rows={2} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "جارٍ الحفظ..."
          : mode === "create"
            ? "إضافة نقطة التوزيع"
            : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
