import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatNumber } from "@/lib/format";
import type { CustomerReportSummary } from "@/lib/reports/queries";

export function CustomersReportSection({
  summary,
  hasRange,
}: {
  summary: CustomerReportSummary;
  hasRange: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">المشتركون</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي المشتركين (حالياً)"
          value={formatNumber(summary.total)}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="نشطون (حالياً)"
          value={formatNumber(summary.active)}
          icon={UserCheck}
          accent="aqua"
        />
        <StatCard
          label="غير نشطين/مؤرشفين (حالياً)"
          value={formatNumber(summary.inactive + summary.archived)}
          icon={UserX}
          accent="orange"
        />
        <StatCard
          label={hasRange ? "مشتركون جدد خلال الفترة" : "مشتركون جدد (كل الفترة)"}
          value={formatNumber(summary.newInRange)}
          icon={UserPlus}
          accent="violet"
        />
      </div>
    </section>
  );
}
