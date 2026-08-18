import { Separator } from "@/components/ui/separator";
import { ReportsDateRangeFilter } from "@/components/reports/reports-date-range-filter";
import { CustomersReportSection } from "@/components/reports/customers-report-section";
import { SubscriptionsReportSection } from "@/components/reports/subscriptions-report-section";
import { PaymentsReportSection } from "@/components/reports/payments-report-section";
import { TicketsReportSection } from "@/components/reports/tickets-report-section";
import { NetworkReportSection } from "@/components/reports/network-report-section";
import { getPopularPlans } from "@/lib/dashboard/queries";
import {
  getAverageResolutionHours,
  getCustomerReportSummary,
  getDevicesByStatus,
  getDevicesByType,
  getMonthlyRevenueTrend,
  getNetworkReportSummary,
  getOutstandingBalanceSummary,
  getPaymentsByMethod,
  getPaymentsReportSummary,
  getSubscriptionStatusReport,
  getSubscriptionsCreatedInRange,
  getTicketsByCategory,
  getTicketsByPriority,
  getTicketsByTechnician,
  getTicketsCreatedTrend,
  getTicketsStatusReport,
  type ReportDateRange,
} from "@/lib/reports/queries";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range: ReportDateRange = { from: params.from, to: params.to };
  const hasRange = Boolean(params.from || params.to);

  const [
    customerSummary,
    subscriptionStatusReport,
    subscriptionsCreatedInRange,
    popularPlans,
    paymentsSummary,
    paymentsByMethod,
    outstandingBalance,
    revenueTrend,
    ticketsStatusReport,
    ticketsByPriority,
    ticketsByCategory,
    ticketsByTechnician,
    averageResolutionHours,
    ticketsTrend,
    networkSummary,
    devicesByType,
    devicesByStatus,
  ] = await Promise.all([
    getCustomerReportSummary(range),
    getSubscriptionStatusReport(),
    getSubscriptionsCreatedInRange(range),
    getPopularPlans(),
    getPaymentsReportSummary(range),
    getPaymentsByMethod(range),
    getOutstandingBalanceSummary(),
    getMonthlyRevenueTrend(),
    getTicketsStatusReport(range),
    getTicketsByPriority(range),
    getTicketsByCategory(range),
    getTicketsByTechnician(range),
    getAverageResolutionHours(range),
    getTicketsCreatedTrend(),
    getNetworkReportSummary(),
    getDevicesByType(),
    getDevicesByStatus(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">التقارير</h1>
        <p className="text-sm text-muted-foreground">
          تقارير تشغيلية ومالية مبنية على بيانات النظام الفعلية.
        </p>
      </div>

      <ReportsDateRangeFilter />

      <CustomersReportSection summary={customerSummary} hasRange={hasRange} />
      <Separator />

      <SubscriptionsReportSection
        statusReport={subscriptionStatusReport}
        createdInRange={subscriptionsCreatedInRange}
        hasRange={hasRange}
        plans={popularPlans}
      />
      <Separator />

      <PaymentsReportSection
        summary={paymentsSummary}
        hasRange={hasRange}
        byMethod={paymentsByMethod}
        balance={outstandingBalance}
        revenueTrend={revenueTrend}
      />
      <Separator />

      <TicketsReportSection
        statusReport={ticketsStatusReport}
        hasRange={hasRange}
        byPriority={ticketsByPriority}
        byCategory={ticketsByCategory}
        byTechnician={ticketsByTechnician}
        averageResolutionHours={averageResolutionHours}
        trend={ticketsTrend}
      />
      <Separator />

      <NetworkReportSection
        summary={networkSummary}
        byType={devicesByType}
        byStatus={devicesByStatus}
      />
    </div>
  );
}
