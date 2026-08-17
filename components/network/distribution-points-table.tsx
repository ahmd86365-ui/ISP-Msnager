import Link from "next/link";
import type { DistributionPoint } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EquipmentStatusBadge } from "@/components/shared/equipment-status-badge";
import { formatNumber } from "@/lib/format";
import { EditDistributionPointDialog } from "./edit-distribution-point-dialog";
import { DeleteDistributionPointDialog } from "./delete-distribution-point-dialog";

type DistributionPointRow = DistributionPoint & {
  devicesCount: number;
  buildingsCount: number;
};

export function DistributionPointsTable({ points }: { points: DistributionPointRow[] }) {
  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">لا توجد نقاط توزيع بعد</p>
        <p className="text-sm text-muted-foreground">
          أضف أول نقطة توزيع لبدء بناء خريطة الشبكة.
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
            <TableHead>الرمز</TableHead>
            <TableHead>المنطقة</TableHead>
            <TableHead>الأبنية</TableHead>
            <TableHead>الأجهزة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {points.map((point) => (
            <TableRow key={point.id}>
              <TableCell className="font-medium text-foreground">{point.name}</TableCell>
              <TableCell dir="ltr" className="text-end font-mono text-muted-foreground">
                {point.code}
              </TableCell>
              <TableCell className="text-muted-foreground">{point.area}</TableCell>
              <TableCell className="text-muted-foreground">
                <Link
                  href={`/network/buildings?distributionPointId=${point.id}`}
                  className="hover:underline"
                >
                  {formatNumber(point.buildingsCount)}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <Link
                  href={`/network/devices?distributionPointId=${point.id}`}
                  className="hover:underline"
                >
                  {formatNumber(point.devicesCount)}
                </Link>
              </TableCell>
              <TableCell>
                <EquipmentStatusBadge status={point.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <EditDistributionPointDialog point={point} />
                  <DeleteDistributionPointDialog pointId={point.id} pointName={point.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
