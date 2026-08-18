import { Wrench, Clock, CheckCircle2, Timer } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBreakdownList } from "@/components/reports/report-breakdown-list";
import { TicketsTrendChart } from "@/components/reports/tickets-trend-chart";
import { formatNumber } from "@/lib/format";
import type {
  ReportBreakdownItem,
  TicketsStatusReport,
  WeeklyTicketPoint,
} from "@/lib/reports/queries";

function formatHours(hours: number | null): string {
  if (hours === null) {
    return "لا توجد بيانات كافية";
  }
  if (hours < 1) {
    return "أقل من ساعة";
  }
  if (hours < 48) {
    return `${hours.toFixed(1)} ساعة`;
  }
  return `${(hours / 24).toFixed(1)} يوم`;
}

export function TicketsReportSection({
  statusReport,
  hasRange,
  byPriority,
  byCategory,
  byTechnician,
  averageResolutionHours,
  trend,
}: {
  statusReport: TicketsStatusReport;
  hasRange: boolean;
  byPriority: ReportBreakdownItem[];
  byCategory: ReportBreakdownItem[];
  byTechnician: ReportBreakdownItem[];
  averageResolutionHours: number | null;
  trend: WeeklyTicketPoint[];
}) {
  const openCount = statusReport.open + statusReport.inProgress + statusReport.waiting;
  const closedCount = statusReport.resolved + statusReport.closed;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">الأعطال والدعم الفني</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={hasRange ? "إجمالي البلاغات خلال الفترة" : "إجمالي البلاغات (كل الفترة)"}
          value={formatNumber(statusReport.total)}
          icon={Wrench}
          accent="blue"
        />
        <StatCard
          label={hasRange ? "مفتوحة/قيد المعالجة خلال الفترة" : "مفتوحة/قيد المعالجة (كل الفترة)"}
          value={formatNumber(openCount)}
          icon={Clock}
          accent="orange"
        />
        <StatCard
          label={hasRange ? "محلولة/مغلقة خلال الفترة" : "محلولة/مغلقة (كل الفترة)"}
          value={formatNumber(closedCount)}
          icon={CheckCircle2}
          accent="aqua"
        />
        <StatCard
          label={hasRange ? "متوسط وقت الحل خلال الفترة" : "متوسط وقت الحل (كل الفترة)"}
          value={formatHours(averageResolutionHours)}
          icon={Timer}
          accent="violet"
        />
      </div>

      <TicketsTrendChart data={trend} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReportBreakdownList
          title="حسب الأولوية"
          items={byPriority}
          emptyMessage="لا توجد بلاغات"
        />
        <ReportBreakdownList
          title="حسب التصنيف"
          items={byCategory}
          emptyMessage="لا توجد بلاغات"
        />
        <ReportBreakdownList
          title="حسب الفني المسؤول"
          items={byTechnician}
          emptyMessage="لا توجد بلاغات"
        />
      </div>
    </section>
  );
}
