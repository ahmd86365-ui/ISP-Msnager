import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { EquipmentStatusBadge } from "@/components/shared/equipment-status-badge";
import { EditDeviceDialog } from "@/components/network/edit-device-dialog";
import { AddPortDialog } from "@/components/network/add-port-dialog";
import { PortsTable } from "@/components/network/ports-table";
import { getDeviceById } from "@/lib/network/devices/queries";
import { listDistributionPointsForSelect } from "@/lib/network/distribution-points/queries";
import { listBuildingsForSelect } from "@/lib/customers/queries";
import { NETWORK_DEVICE_TYPE_LABELS } from "@/lib/labels";

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const device = await getDeviceById(id);

  if (!device) {
    notFound();
  }

  const [distributionPoints, buildings] = await Promise.all([
    listDistributionPointsForSelect(),
    listBuildingsForSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{device.name}</h1>
              <EquipmentStatusBadge status={device.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {NETWORK_DEVICE_TYPE_LABELS[device.type]} · {device.vendor} / {device.model}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <EditDeviceDialog
              device={device}
              distributionPoints={distributionPoints}
              buildings={buildings}
              buttonVariant="outline"
              buttonSize="sm"
              showLabel
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              معلومات الجهاز
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              {device.hostname && (
                <>
                  <dt className="text-muted-foreground">اسم المضيف</dt>
                  <dd dir="ltr" className="text-end text-foreground">
                    {device.hostname}
                  </dd>
                </>
              )}
              {device.serialNumber && (
                <>
                  <dt className="text-muted-foreground">الرقم التسلسلي</dt>
                  <dd dir="ltr" className="text-end font-mono text-foreground">
                    {device.serialNumber}
                  </dd>
                </>
              )}
              {device.mac && (
                <>
                  <dt className="text-muted-foreground">عنوان MAC</dt>
                  <dd dir="ltr" className="text-end font-mono text-foreground">
                    {device.mac}
                  </dd>
                </>
              )}
              {device.managementIp && (
                <>
                  <dt className="text-muted-foreground">عنوان الإدارة IP</dt>
                  <dd dir="ltr" className="text-end font-mono text-foreground">
                    {device.managementIp}
                  </dd>
                </>
              )}
            </dl>
            {device.notes && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="mt-1 text-sm text-foreground">{device.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              الموقع
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">نقطة التوزيع</dt>
              <dd className="text-end text-foreground">{device.distributionPoint.name}</dd>
              <dt className="text-muted-foreground">البناء</dt>
              <dd className="text-end text-foreground">{device.building?.name ?? "—"}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {device.type === "SWITCH" && (
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-medium text-foreground">المنافذ</h2>
              <AddPortDialog deviceId={device.id} />
            </div>
            <PortsTable deviceId={device.id} ports={device.ports} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
