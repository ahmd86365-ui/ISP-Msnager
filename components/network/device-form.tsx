"use client";

import { useActionState, useEffect, useId, useState } from "react";
import type { EquipmentStatus, NetworkDevice, NetworkDeviceType } from "@prisma/client";

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
import { EQUIPMENT_STATUS_LABELS, NETWORK_DEVICE_TYPE_LABELS } from "@/lib/labels";
import type { DeviceFormState } from "@/lib/network/devices/actions";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

interface BuildingOption {
  id: string;
  name: string;
  distributionPointId: string;
}

const DEVICE_TYPES: NetworkDeviceType[] = ["ROUTER", "SWITCH", "ACCESS_POINT", "CPE", "OTHER"];
const NO_BUILDING_VALUE = "__none__";

const INITIAL_STATE: DeviceFormState = {};

export function DeviceForm({
  mode,
  device,
  distributionPoints,
  buildings,
  action,
  onSuccess,
}: {
  mode: "create" | "edit";
  device?: NetworkDevice;
  distributionPoints: DistributionPointOption[];
  buildings: BuildingOption[];
  action: (prevState: DeviceFormState, formData: FormData) => Promise<DeviceFormState>;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.errors ?? {};
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [distributionPointId, setDistributionPointId] = useState(
    device?.distributionPointId ?? distributionPoints[0]?.id ?? "",
  );
  const [buildingId, setBuildingId] = useState(device?.buildingId ?? NO_BUILDING_VALUE);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
    // onSuccess is expected to be a stable callback from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  const buildingsForPoint = buildings.filter((b) => b.distributionPointId === distributionPointId);

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
          <Label htmlFor={fieldId("name")}>اسم الجهاز</Label>
          <Input id={fieldId("name")} name="name" defaultValue={device?.name} required />
          {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("hostname")}>اسم المضيف (اختياري)</Label>
          <Input
            id={fieldId("hostname")}
            name="hostname"
            dir="ltr"
            className="text-end"
            defaultValue={device?.hostname ?? ""}
          />
          {errors.hostname && <p className="text-xs text-destructive">{errors.hostname[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("type")}>نوع الجهاز</Label>
          <Select name="type" defaultValue={device?.type ?? "ROUTER"}>
            <SelectTrigger id={fieldId("type")} className="w-full">
              <SelectValue>
                {(value: NetworkDeviceType | null) =>
                  value ? NETWORK_DEVICE_TYPE_LABELS[value] : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {NETWORK_DEVICE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type[0]}</p>}
        </div>

        {mode === "edit" && device && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={fieldId("status")}>الحالة</Label>
            <Select name="status" defaultValue={device.status}>
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
          <Label htmlFor={fieldId("vendor")}>الشركة المصنّعة</Label>
          <Input id={fieldId("vendor")} name="vendor" defaultValue={device?.vendor} required />
          {errors.vendor && <p className="text-xs text-destructive">{errors.vendor[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("model")}>الموديل</Label>
          <Input id={fieldId("model")} name="model" defaultValue={device?.model} required />
          {errors.model && <p className="text-xs text-destructive">{errors.model[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("serialNumber")}>الرقم التسلسلي (اختياري)</Label>
          <Input
            id={fieldId("serialNumber")}
            name="serialNumber"
            dir="ltr"
            className="text-end"
            defaultValue={device?.serialNumber ?? ""}
          />
          {errors.serialNumber && (
            <p className="text-xs text-destructive">{errors.serialNumber[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("mac")}>عنوان MAC (اختياري)</Label>
          <Input
            id={fieldId("mac")}
            name="mac"
            dir="ltr"
            className="text-end"
            defaultValue={device?.mac ?? ""}
          />
          {errors.mac && <p className="text-xs text-destructive">{errors.mac[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("managementIp")}>عنوان الإدارة IP (اختياري)</Label>
          <Input
            id={fieldId("managementIp")}
            name="managementIp"
            dir="ltr"
            className="text-end"
            defaultValue={device?.managementIp ?? ""}
          />
          {errors.managementIp && (
            <p className="text-xs text-destructive">{errors.managementIp[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={fieldId("distributionPointId")}>نقطة التوزيع</Label>
          <Select
            name="distributionPointId"
            value={distributionPointId}
            onValueChange={(value) => {
              setDistributionPointId(value ?? "");
              setBuildingId(NO_BUILDING_VALUE);
            }}
          >
            <SelectTrigger id={fieldId("distributionPointId")} className="w-full">
              <SelectValue placeholder="اختر نقطة توزيع">
                {(value: string | null) => {
                  const selected = distributionPoints.find((p) => p.id === value);
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
          <Label htmlFor={fieldId("buildingId")}>البناء (اختياري)</Label>
          <Select
            value={buildingId}
            onValueChange={(value) => setBuildingId(value ?? NO_BUILDING_VALUE)}
            disabled={buildingsForPoint.length === 0}
          >
            <SelectTrigger id={fieldId("buildingId")} className="w-full">
              <SelectValue>
                {(value: string | null) => {
                  if (!value || value === NO_BUILDING_VALUE) return "بدون بناء محدد";
                  return buildingsForPoint.find((b) => b.id === value)?.name ?? "بدون بناء محدد";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_BUILDING_VALUE}>بدون بناء محدد</SelectItem>
              {buildingsForPoint.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="buildingId"
            value={buildingId === NO_BUILDING_VALUE ? "" : buildingId}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId("notes")}>ملاحظات (اختياري)</Label>
        <Textarea id={fieldId("notes")} name="notes" defaultValue={device?.notes ?? ""} rows={2} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "جارٍ الحفظ..." : mode === "create" ? "إضافة الجهاز" : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
