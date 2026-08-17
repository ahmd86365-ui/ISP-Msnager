import Link from "next/link";
import { Eye } from "lucide-react";
import type { NetworkDevice } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EquipmentStatusBadge } from "@/components/shared/equipment-status-badge";
import { NETWORK_DEVICE_TYPE_LABELS } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
import { EditDeviceDialog } from "./edit-device-dialog";
import { DeleteDeviceDialog } from "./delete-device-dialog";

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

type DeviceRow = NetworkDevice & {
  distributionPoint: { name: string };
  building: { name: string } | null;
  _count: { ports: number };
};

export function DevicesTable({
  devices,
  distributionPoints,
  buildings,
}: {
  devices: DeviceRow[];
  distributionPoints: DistributionPointOption[];
  buildings: BuildingOption[];
}) {
  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">لا توجد أجهزة مطابقة</p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل البحث أو الفلاتر، أو أضف جهازاً جديداً.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الشركة/الموديل</TableHead>
            <TableHead>نقطة التوزيع</TableHead>
            <TableHead>البناء</TableHead>
            <TableHead>المنافذ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <Link
                  href={`/network/devices/${device.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {device.name}
                </Link>
                {device.hostname && (
                  <p dir="ltr" className="text-end text-xs text-muted-foreground">
                    {device.hostname}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {NETWORK_DEVICE_TYPE_LABELS[device.type]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.vendor} / {device.model}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.distributionPoint.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.building?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.type === "SWITCH" ? formatNumber(device._count.ports) : "—"}
              </TableCell>
              <TableCell>
                <EquipmentStatusBadge status={device.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/network/devices/${device.id}`} />}
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">عرض</span>
                  </Button>
                  <EditDeviceDialog
                    device={device}
                    distributionPoints={distributionPoints}
                    buildings={buildings}
                  />
                  <DeleteDeviceDialog deviceId={device.id} deviceName={device.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
