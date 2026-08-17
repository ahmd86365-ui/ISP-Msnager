import { Card, CardContent } from "@/components/ui/card";
import { AddPlanDialog } from "@/components/plans/add-plan-dialog";
import { PlansTable } from "@/components/plans/plans-table";
import { listPlans } from "@/lib/plans/queries";
import { formatNumber } from "@/lib/format";

export default async function PlansPage() {
  const plans = await listPlans();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الباقات</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(plans.length)} باقة إجمالاً
          </p>
        </div>
        <AddPlanDialog />
      </div>

      <Card>
        <CardContent>
          <PlansTable plans={plans} />
        </CardContent>
      </Card>
    </div>
  );
}
