import type { Building } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { EditBuildingDialog } from "./edit-building-dialog";
import { DeleteBuildingDialog } from "./delete-building-dialog";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

type BuildingRow = Building & {
  distributionPoint: { name: string };
  customersCount: number;
};

export function BuildingsTable({
  buildings,
  distributionPoints,
}: {
  buildings: BuildingRow[];
  distributionPoints: DistributionPointOption[];
}) {
  if (buildings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">لا توجد أبنية مطابقة</p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل الفلاتر، أو أضف بناءً جديداً.
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
            <TableHead>العنوان</TableHead>
            <TableHead>المنطقة</TableHead>
            <TableHead>نقطة التوزيع</TableHead>
            <TableHead>المشتركون</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buildings.map((building) => (
            <TableRow key={building.id}>
              <TableCell className="font-medium text-foreground">{building.name}</TableCell>
              <TableCell className="text-muted-foreground">{building.address}</TableCell>
              <TableCell className="text-muted-foreground">{building.area}</TableCell>
              <TableCell className="text-muted-foreground">
                {building.distributionPoint.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatNumber(building.customersCount)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <EditBuildingDialog building={building} distributionPoints={distributionPoints} />
                  <DeleteBuildingDialog buildingId={building.id} buildingName={building.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
