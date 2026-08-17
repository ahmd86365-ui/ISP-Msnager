"use client";

import { useId, useState, useTransition } from "react";
import { Link2, RefreshCw } from "lucide-react";
import type { EquipmentStatus, NetworkDeviceType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NETWORK_DEVICE_TYPE_LABELS } from "@/lib/labels";
import { assignNetworkAction } from "@/lib/network/assignments/actions";

export interface NetworkTreePort {
  id: string;
  portNumber: number;
  label: string | null;
  status: EquipmentStatus;
}

export interface NetworkTreeDevice {
  id: string;
  name: string;
  type: NetworkDeviceType;
  ports: NetworkTreePort[];
}

export interface NetworkTreePoint {
  id: string;
  name: string;
  code: string;
  devices: NetworkTreeDevice[];
}

const NONE_VALUE = "__none__";

export function AssignNetworkDialog({
  customerId,
  tree,
  hasCurrentAssignment,
}: {
  customerId: string;
  tree: NetworkTreePoint[];
  hasCurrentAssignment: boolean;
}) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [distributionPointId, setDistributionPointId] = useState(NONE_VALUE);
  const [deviceId, setDeviceId] = useState(NONE_VALUE);
  const [switchPortId, setSwitchPortId] = useState(NONE_VALUE);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await assignNetworkAction(customerId, {}, formData);
      if (result.ok) {
        setOpen(false);
      } else {
        setErrors(result.errors ?? {});
      }
    });
  }

  const selectedPoint = tree.find((point) => point.id === distributionPointId);
  const devicesForPoint = selectedPoint?.devices ?? [];
  const selectedDevice = devicesForPoint.find((device) => device.id === deviceId);
  const portsForDevice = selectedDevice?.type === "SWITCH" ? selectedDevice.ports : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setErrors({});
      }}
    >
      <Button size="sm" onClick={() => setOpen(true)}>
        {hasCurrentAssignment ? (
          <RefreshCw className="size-4" />
        ) : (
          <Link2 className="size-4" />
        )}
        {hasCurrentAssignment ? "نقل / تعديل الربط" : "ربط بالشبكة"}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{hasCurrentAssignment ? "نقل أو تعديل الربط الشبكي" : "ربط المشترك بالشبكة"}</DialogTitle>
          <DialogDescription>
            {hasCurrentAssignment
              ? "سيتم إنهاء الربط الحالي وإنشاء ربط جديد. يبقى الربط السابق محفوظاً ضمن السجل التاريخي."
              : "اختر نقطة التوزيع والجهاز والمنفذ (إن وجد) لربط هذا المشترك بالشبكة."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {errors._form && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errors._form[0]}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-distributionPointId`}>نقطة التوزيع (اختياري)</Label>
            <Select
              value={distributionPointId}
              onValueChange={(value) => {
                setDistributionPointId(value ?? NONE_VALUE);
                setDeviceId(NONE_VALUE);
                setSwitchPortId(NONE_VALUE);
              }}
            >
              <SelectTrigger id={`${uid}-distributionPointId`} className="w-full">
                <SelectValue>
                  {(value: string | null) => {
                    if (!value || value === NONE_VALUE) return "بدون تحديد";
                    return tree.find((point) => point.id === value)?.name ?? "بدون تحديد";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>بدون تحديد</SelectItem>
                {tree.map((point) => (
                  <SelectItem key={point.id} value={point.id}>
                    {point.name} — {point.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="distributionPointId"
              value={distributionPointId === NONE_VALUE ? "" : distributionPointId}
            />
            {errors.distributionPointId && (
              <p className="text-xs text-destructive">{errors.distributionPointId[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-deviceId`}>الجهاز (اختياري)</Label>
            <Select
              value={deviceId}
              onValueChange={(value) => {
                setDeviceId(value ?? NONE_VALUE);
                setSwitchPortId(NONE_VALUE);
              }}
              disabled={devicesForPoint.length === 0}
            >
              <SelectTrigger id={`${uid}-deviceId`} className="w-full">
                <SelectValue>
                  {(value: string | null) => {
                    if (!value || value === NONE_VALUE) return "بدون تحديد";
                    const device = devicesForPoint.find((d) => d.id === value);
                    return device
                      ? `${device.name} (${NETWORK_DEVICE_TYPE_LABELS[device.type]})`
                      : "بدون تحديد";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>بدون تحديد</SelectItem>
                {devicesForPoint.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name} ({NETWORK_DEVICE_TYPE_LABELS[device.type]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="deviceId" value={deviceId === NONE_VALUE ? "" : deviceId} />
            {errors.deviceId && <p className="text-xs text-destructive">{errors.deviceId[0]}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-switchPortId`}>المنفذ (اختياري)</Label>
            <Select
              value={switchPortId}
              onValueChange={(value) => setSwitchPortId(value ?? NONE_VALUE)}
              disabled={portsForDevice.length === 0}
            >
              <SelectTrigger id={`${uid}-switchPortId`} className="w-full">
                <SelectValue>
                  {(value: string | null) => {
                    if (!value || value === NONE_VALUE) return "بدون تحديد";
                    const port = portsForDevice.find((p) => p.id === value);
                    return port ? `منفذ ${port.portNumber}${port.label ? ` — ${port.label}` : ""}` : "بدون تحديد";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>بدون تحديد</SelectItem>
                {portsForDevice.map((port) => (
                  <SelectItem key={port.id} value={port.id}>
                    منفذ {port.portNumber}
                    {port.label ? ` — ${port.label}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              name="switchPortId"
              value={switchPortId === NONE_VALUE ? "" : switchPortId}
            />
            {errors.switchPortId && (
              <p className="text-xs text-destructive">{errors.switchPortId[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${uid}-ipAddress`}>عنوان IP (اختياري)</Label>
              <Input
                id={`${uid}-ipAddress`}
                name="ipAddress"
                dir="ltr"
                className="text-end"
              />
              {errors.ipAddress && (
                <p className="text-xs text-destructive">{errors.ipAddress[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${uid}-macAddress`}>عنوان MAC (اختياري)</Label>
              <Input
                id={`${uid}-macAddress`}
                name="macAddress"
                dir="ltr"
                className="text-end"
              />
              {errors.macAddress && (
                <p className="text-xs text-destructive">{errors.macAddress[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${uid}-notes`}>ملاحظات (اختياري)</Label>
            <Textarea id={`${uid}-notes`} name="notes" rows={2} />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes[0]}</p>}
          </div>

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "جارٍ الحفظ..." : hasCurrentAssignment ? "تأكيد النقل/التعديل" : "تأكيد الربط"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
