"use client";

import { useActionState, useEffect } from "react";
import type { Customer } from "@prisma/client";

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
import type { CustomerFormState } from "@/lib/customers/actions";
import { CUSTOMER_STATUS_LABELS } from "./customer-status-badge";

interface Building {
  id: string;
  name: string;
}

const INITIAL_STATE: CustomerFormState = {};

export function CustomerForm({
  mode,
  customer,
  buildings,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  customer?: Customer;
  buildings: Building[];
  action: (
    prevState: CustomerFormState,
    formData: FormData,
  ) => Promise<CustomerFormState>;
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
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={customer?.fullName}
            required
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={customer?.phone}
            required
            dir="ltr"
            className="text-end"
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone2">رقم هاتف إضافي (اختياري)</Label>
          <Input
            id="phone2"
            name="phone2"
            defaultValue={customer?.phone2 ?? ""}
            dir="ltr"
            className="text-end"
          />
          {errors.phone2 && (
            <p className="text-xs text-destructive">{errors.phone2[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="buildingId">البناء</Label>
          <Select name="buildingId" defaultValue={customer?.buildingId}>
            <SelectTrigger id="buildingId" className="w-full">
              <SelectValue placeholder="اختر البناء" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.buildingId && (
            <p className="text-xs text-destructive">{errors.buildingId[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unitLabel">رقم الشقة / الوحدة</Label>
          <Input
            id="unitLabel"
            name="unitLabel"
            defaultValue={customer?.unitLabel}
            required
          />
          {errors.unitLabel && (
            <p className="text-xs text-destructive">{errors.unitLabel[0]}</p>
          )}
        </div>

        {mode === "edit" && customer && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">الحالة</Label>
            <Select name="status" defaultValue={customer.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
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
        <Label htmlFor="address">العنوان</Label>
        <Input
          id="address"
          name="address"
          defaultValue={customer?.address}
          required
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={customer?.notes ?? ""}
          rows={3}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending
          ? "جارٍ الحفظ..."
          : mode === "create"
            ? "إضافة المشترك"
            : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
