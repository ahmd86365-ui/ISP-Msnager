import { Layers, RefreshCw } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBreakdownList } from "@/components/reports/report-breakdown-list";
import { formatNumber } from "@/lib/format";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/labels";
import type { PopularPlan } from "@/lib/dashboard/queries";
import type { SubscriptionStatusReport } from "@/lib/reports/queries";

export function SubscriptionsReportSection({
  statusReport,
  createdInRange,
  hasRange,
  plans,
}: {
  statusReport: SubscriptionStatusReport;
  createdInRange: number;
  hasRange: boolean;
  plans: PopularPlan[];
}) {
  const statusItems = (
    Object.entries(statusReport) as [keyof SubscriptionStatusReport, number][]
  ).map(([key, value]) => ({
    key,
    label: SUBSCRIPTION_STATUS_LABELS[key.toUpperCase() as keyof typeof SUBSCRIPTION_STATUS_LABELS],
    value,
    percentage: 0,
  }));
  const statusTotal = statusItems.reduce((sum, item) => sum + item.value, 0);
  const statusBreakdown = statusItems.map((item) => ({
    ...item,
    percentage: statusTotal > 0 ? Math.round((item.value / statusTotal) * 100) : 0,
  }));

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">الاشتراكات</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="اشتراكات فعالة (حالياً)"
          value={formatNumber(statusReport.active)}
          icon={Layers}
          accent="aqua"
        />
        <StatCard
          label={
            hasRange
              ? "اشتراكات جديدة/متجددة خلال الفترة"
              : "اشتراكات جديدة/متجددة (كل الفترة)"
          }
          value={formatNumber(createdInRange)}
          icon={RefreshCw}
          accent="violet"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBreakdownList
          title="الاشتراكات حسب الحالة (حالياً)"
          items={statusBreakdown}
          emptyMessage="لا توجد اشتراكات بعد"
        />
        <ReportBreakdownList
          title="الاشتراكات الفعالة حسب الباقة (حالياً)"
          items={plans.map((plan) => ({
            key: plan.planId,
            label: plan.name,
            value: plan.count,
            percentage: plan.percentage,
          }))}
          emptyMessage="لا توجد اشتراكات فعالة بعد"
        />
      </div>
    </section>
  );
}
