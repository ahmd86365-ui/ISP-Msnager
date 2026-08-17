import { TrendingUp, Users, Wallet, Wrench } from "lucide-react";

import { DateSelector } from "@/components/dashboard/date-selector";
import { PaymentsChart } from "@/components/dashboard/payments-chart";
import { PopularPlans } from "@/components/dashboard/popular-plans";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { formatNumber, formatSyp } from "@/lib/format";
import {
  getDashboardSummary,
  getPopularPlans,
  getRecentOpenTickets,
  getSubscriptionStatusBreakdown,
} from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const [summary, statusBreakdown, popularPlans, recentTickets] =
    await Promise.all([
      getDashboardSummary(),
      getSubscriptionStatusBreakdown(),
      getPopularPlans(),
      getRecentOpenTickets(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">الرئيسية</h1>
          <p className="text-sm text-muted-foreground">لوحة التحكم</p>
        </div>
        <DateSelector />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي المشتركين"
          value={formatNumber(summary.totalCustomers)}
          icon={Users}
          accent="aqua"
          delta={
            summary.newCustomersThisMonth > 0
              ? {
                  text: `+${formatNumber(summary.newCustomersThisMonth)} هذا الشهر`,
                  tone: "good",
                }
              : undefined
          }
        />
        <StatCard
          label="إجمالي الدفعات (هذا الشهر)"
          value={formatSyp(summary.paymentsThisMonthTotal)}
          icon={Wallet}
          accent="blue"
          delta={
            summary.paymentsMonthOverMonthPct !== null
              ? {
                  text: `${summary.paymentsMonthOverMonthPct >= 0 ? "+" : ""}${summary.paymentsMonthOverMonthPct}% عن الشهر الماضي`,
                  tone: summary.paymentsMonthOverMonthPct >= 0 ? "good" : "bad",
                }
              : undefined
          }
        />
        <StatCard
          label="إجمالي الديون"
          value={formatSyp(summary.totalOutstanding)}
          icon={TrendingUp}
          accent="orange"
        />
        <StatCard
          label="الأعطال المفتوحة"
          value={formatNumber(summary.openTicketsCount)}
          icon={Wrench}
          accent="violet"
          delta={
            summary.newOpenTicketsSinceYesterday > 0
              ? {
                  text: `+${formatNumber(summary.newOpenTicketsSinceYesterday)} عن أمس`,
                  tone: "neutral",
                }
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaymentsChart />
        </div>
        <RecentTickets tickets={recentTickets} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PopularPlans plans={popularPlans} />
        </div>
        <StatusDonut
          active={statusBreakdown.active}
          suspended={statusBreakdown.suspended}
          expired={statusBreakdown.expired}
        />
      </div>
    </div>
  );
}
