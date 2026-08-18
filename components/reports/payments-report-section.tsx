import { Wallet, Receipt, Ban, TrendingDown } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBreakdownList } from "@/components/reports/report-breakdown-list";
import { RevenueTrendChart } from "@/components/reports/revenue-trend-chart";
import { formatNumber, formatSyp } from "@/lib/format";
import type {
  MonthlyRevenuePoint,
  OutstandingBalanceSummary,
  PaymentsReportSummary,
  ReportBreakdownItem,
} from "@/lib/reports/queries";

export function PaymentsReportSection({
  summary,
  hasRange,
  byMethod,
  balance,
  revenueTrend,
}: {
  summary: PaymentsReportSummary;
  hasRange: boolean;
  byMethod: ReportBreakdownItem[];
  balance: OutstandingBalanceSummary;
  revenueTrend: MonthlyRevenuePoint[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">المالية والدفعات</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={hasRange ? "إجمالي الدفعات خلال الفترة" : "إجمالي الدفعات (كل الفترة)"}
          value={formatSyp(summary.totalAmountSyp)}
          icon={Wallet}
          accent="blue"
        />
        <StatCard
          label={hasRange ? "عدد الدفعات خلال الفترة" : "عدد الدفعات (كل الفترة)"}
          value={formatNumber(summary.count)}
          icon={Receipt}
          accent="aqua"
        />
        <StatCard
          label={hasRange ? "دفعات ملغاة خلال الفترة" : "دفعات ملغاة (كل الفترة)"}
          value={formatNumber(summary.voidedCount)}
          icon={Ban}
          accent="orange"
        />
        <StatCard
          label="إجمالي الديون المستحقة (حالياً)"
          value={formatSyp(balance.debtSyp)}
          icon={TrendingDown}
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueTrendChart data={revenueTrend} />
        <ReportBreakdownList
          title={hasRange ? "الدفعات حسب طريقة الدفع خلال الفترة" : "الدفعات حسب طريقة الدفع (كل الفترة)"}
          items={byMethod}
          emptyMessage="لا توجد دفعات مسجّلة"
          formatValue={formatSyp}
        />
      </div>
    </section>
  );
}
