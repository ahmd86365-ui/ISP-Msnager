import { Building2, MapPin, Router, Cable } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBreakdownList } from "@/components/reports/report-breakdown-list";
import { formatNumber } from "@/lib/format";
import type { NetworkReportSummary, ReportBreakdownItem } from "@/lib/reports/queries";

export function NetworkReportSection({
  summary,
  byType,
  byStatus,
}: {
  summary: NetworkReportSummary;
  byType: ReportBreakdownItem[];
  byStatus: ReportBreakdownItem[];
}) {
  const portsFreeCount = Math.max(0, summary.portsTotal - summary.portsAssigned);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">الشبكة والمخزون</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الأبنية (حالياً)"
          value={formatNumber(summary.buildingsCount)}
          icon={Building2}
          accent="blue"
        />
        <StatCard
          label="نقاط التوزيع (حالياً)"
          value={formatNumber(summary.distributionPointsCount)}
          icon={MapPin}
          accent="aqua"
        />
        <StatCard
          label="الأجهزة (حالياً)"
          value={formatNumber(summary.devicesCount)}
          icon={Router}
          accent="orange"
        />
        <StatCard
          label="منافذ مشغولة / إجمالي المنافذ (حالياً)"
          value={`${formatNumber(summary.portsAssigned)} / ${formatNumber(summary.portsTotal)}`}
          icon={Cable}
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBreakdownList
          title="الأجهزة حسب النوع (حالياً)"
          items={byType}
          emptyMessage="لا توجد أجهزة مسجّلة"
        />
        <ReportBreakdownList
          title="الأجهزة حسب الحالة (حالياً)"
          items={byStatus}
          emptyMessage="لا توجد أجهزة مسجّلة"
        />
      </div>

      {summary.portsTotal > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatNumber(portsFreeCount)} منفذ متاح حالياً من إجمالي{" "}
          {formatNumber(summary.portsTotal)} منفذ.
        </p>
      )}
    </section>
  );
}
