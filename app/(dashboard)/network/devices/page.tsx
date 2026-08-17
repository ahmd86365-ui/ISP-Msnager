import type { EquipmentStatus, NetworkDeviceType } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { AddDeviceDialog } from "@/components/network/add-device-dialog";
import { DevicesFilters } from "@/components/network/devices-filters";
import { DevicesTable } from "@/components/network/devices-table";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { listDevices } from "@/lib/network/devices/queries";
import { listDistributionPointsForSelect } from "@/lib/network/distribution-points/queries";
import { listBuildingsForSelect } from "@/lib/customers/queries";
import { formatNumber } from "@/lib/format";

const VALID_TYPES: NetworkDeviceType[] = ["ROUTER", "SWITCH", "ACCESS_POINT", "CPE", "OTHER"];
const VALID_STATUSES: EquipmentStatus[] = ["ACTIVE", "INACTIVE", "MAINTENANCE", "DISABLED"];

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    distributionPointId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const type = VALID_TYPES.includes(params.type as NetworkDeviceType)
    ? (params.type as NetworkDeviceType)
    : undefined;
  const status = VALID_STATUSES.includes(params.status as EquipmentStatus)
    ? (params.status as EquipmentStatus)
    : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ devices, total, pageCount, pageSize }, distributionPoints, buildings] =
    await Promise.all([
      listDevices({
        search: params.q,
        type,
        status,
        distributionPointId: params.distributionPointId,
        page,
      }),
      listDistributionPointsForSelect(),
      listBuildingsForSelect(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الأجهزة</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(total)} جهاز إجمالاً
          </p>
        </div>
        <AddDeviceDialog distributionPoints={distributionPoints} buildings={buildings} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <DevicesFilters distributionPoints={distributionPoints} />
          <DevicesTable devices={devices} distributionPoints={distributionPoints} buildings={buildings} />
          {total > 0 && (
            <PaginationControls
              page={page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
