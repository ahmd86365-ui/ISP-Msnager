import { Card, CardContent } from "@/components/ui/card";
import { AddBuildingDialog } from "@/components/network/add-building-dialog";
import { BuildingsFilters } from "@/components/network/buildings-filters";
import { BuildingsTable } from "@/components/network/buildings-table";
import { listBuildings } from "@/lib/network/buildings/queries";
import { listDistributionPointsForSelect } from "@/lib/network/distribution-points/queries";
import { formatNumber } from "@/lib/format";

export default async function BuildingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; distributionPointId?: string }>;
}) {
  const params = await searchParams;

  const [buildings, distributionPoints] = await Promise.all([
    listBuildings({ search: params.q, distributionPointId: params.distributionPointId }),
    listDistributionPointsForSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الأبنية</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(buildings.length)} بناء إجمالاً
          </p>
        </div>
        <AddBuildingDialog distributionPoints={distributionPoints} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <BuildingsFilters distributionPoints={distributionPoints} />
          <BuildingsTable buildings={buildings} distributionPoints={distributionPoints} />
        </CardContent>
      </Card>
    </div>
  );
}
