import type { Plan } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BILLING_PERIOD_LABELS } from "@/lib/labels";
import { formatNumber, formatSyp } from "@/lib/format";
import { PlanStatusBadge } from "./plan-status-badge";
import { EditPlanDialog } from "./edit-plan-dialog";
import { TogglePlanActiveButton } from "./toggle-plan-active-button";
import { DeletePlanDialog } from "./delete-plan-dialog";

type PlanRow = Plan & { activeSubscribersCount: number };

export function PlansTable({ plans }: { plans: PlanRow[] }) {
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">لا توجد باقات بعد</p>
        <p className="text-sm text-muted-foreground">أضف أول باقة لبدء بيع الاشتراكات.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الباقة</TableHead>
            <TableHead>السرعة</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>دورة الفوترة</TableHead>
            <TableHead>المشتركون الفعالون</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium text-foreground">
                {plan.name}
              </TableCell>
              <TableCell dir="ltr" className="text-end text-muted-foreground">
                {plan.downloadMbps}/{plan.uploadMbps} Mbps
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatSyp(plan.priceSyp)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {BILLING_PERIOD_LABELS[plan.billingPeriod]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatNumber(plan.activeSubscribersCount)}
              </TableCell>
              <TableCell>
                <PlanStatusBadge isActive={plan.isActive} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <EditPlanDialog plan={plan} />
                  <TogglePlanActiveButton planId={plan.id} isActive={plan.isActive} />
                  <DeletePlanDialog planId={plan.id} planName={plan.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
