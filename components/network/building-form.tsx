"use client";

import { useActionState, useEffect, useId } from "react";
import type { Building } from "@prisma/client";

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
import type { BuildingFormState } from "@/lib/network/buildings/actions";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

const INITIAL_STATE: BuildingFormState = {};

export function BuildingForm({
  mode,
  building,
  distributionPoints,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  building?: Building;
  distributionPoints: DistributionPointOption[];
  action: (
    prevState: BuildingFormState,
    formData: FormData,
  ) => Promise<BuildingFormState>;
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
          <Label htmlFor={fieldId("name")}>اسم البناء</Label>
          <Input id={fieldId("name")} name="name" defaultValue={building?.name} required />
          {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("area")}>المنطقة</Label>
          <Input id={fieldId("area")} name="area" defaultValue={building?.area} required />
          {errors.area && <p className="text-xs text-destructive">{errors.area[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={fieldId("distributionPointId")}>نقطة التوزيع</Label>
          <Select
            name="distributionPointId"
            defaultValue={building?.distributionPointId ?? distributionPoints[0]?.id}
          >
            <SelectTrigger id={fieldId("distributionPointId")} className="w-full">
              <SelectValue placeholder="اختر نقطة توزيع">
                {(value: string | null) => {
                  const selected = distributionPoints.find((point) => point.id === value);
                  return selected ? `${selected.name} — ${selected.code}` : null;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {distributionPoints.map((point) => (
                <SelectItem key={point.id} value={point.id}>
                  {point.name} — {point.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.distributionPointId && (
            <p className="text-xs text-destructive">{errors.distributionPointId[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("lat")}>خط العرض (اختياري)</Label>
          <Input
            id={fieldId("lat")}
            name="lat"
            type="number"
            step="any"
            dir="ltr"
            className="text-end"
            defaultValue={building?.lat ?? ""}
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
            defaultValue={building?.lng ?? ""}
          />
          {errors.lng && <p className="text-xs text-destructive">{errors.lng[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("address")}>العنوان</Label>
        <Input id={fieldId("address")} name="address" defaultValue={building?.address} required />
        {errors.address && <p className="text-xs text-destructive">{errors.address[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea
          id={fieldId("notes")}
          name="notes"
          defaultValue={building?.notes ?? ""}
          rows={2}
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : mode === "create" ? "إضافة البناء" : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
