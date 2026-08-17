import { Card, CardContent } from "@/components/ui/card";
import { AddDistributionPointDialog } from "@/components/network/add-distribution-point-dialog";
import { DistributionPointsTable } from "@/components/network/distribution-points-table";
import { listDistributionPoints } from "@/lib/network/distribution-points/queries";
import { formatNumber } from "@/lib/format";

export default async function DistributionPointsPage() {
  const points = await listDistributionPoints();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">نقاط التوزيع</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(points.length)} نقطة توزيع إجمالاً
          </p>
        </div>
        <AddDistributionPointDialog />
      </div>

      <Card>
        <CardContent>
          <DistributionPointsTable points={points} />
        </CardContent>
      </Card>
    </div>
  );
}
