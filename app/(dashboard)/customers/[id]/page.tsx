import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { ArchiveCustomerDialog } from "@/components/customers/archive-customer-dialog";
import { CustomerSubscriptionSummary } from "@/components/customers/customer-subscription-summary";
import { CustomerNetworkSummary } from "@/components/customers/customer-network-summary";
import { CustomerTicketsSummary } from "@/components/customers/customer-tickets-summary";
import { CustomerActivitySummary } from "@/components/customers/customer-activity-summary";
import { CustomerPaymentsSummary } from "@/components/payments/customer-payments-summary";
import {
  getCustomerById,
  getCustomerNetworkSummary,
  getCustomerRecentActivity,
  getCustomerRecentTickets,
  getCustomerSubscriptionSummary,
  listBuildingsForSelect,
} from "@/lib/customers/queries";
import { listActivePlansForSelect } from "@/lib/plans/queries";
import { getCustomerSubscriptionHistory } from "@/lib/subscriptions/queries";
import {
  getCustomerPaymentsTotal,
  getCustomerRecentPayments,
} from "@/lib/payments/queries";
import { getCustomerBalance } from "@/lib/payments/service";
import { listNetworkTreeForAssignmentForm } from "@/lib/network/assignments/queries";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const [
    subscription,
    networkAssignment,
    tickets,
    activity,
    buildings,
    activePlans,
    subscriptionHistory,
    recentPayments,
    totalPaidSyp,
    balance,
    networkTree,
  ] = await Promise.all([
    getCustomerSubscriptionSummary(id),
    getCustomerNetworkSummary(id),
    getCustomerRecentTickets(id),
    getCustomerRecentActivity(id),
    listBuildingsForSelect(),
    listActivePlansForSelect(),
    getCustomerSubscriptionHistory(id),
    getCustomerRecentPayments(id),
    getCustomerPaymentsTotal(id),
    getCustomerBalance(id),
    listNetworkTreeForAssignmentForm(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">
                {customer.fullName}
              </h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.customerNumber} ·{" "}
              <span dir="ltr">{customer.phone}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <EditCustomerDialog customer={customer} buildings={buildings} />
            {customer.status !== "ARCHIVED" && (
              <ArchiveCustomerDialog
                customerId={customer.id}
                customerName={customer.fullName}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              معلومات المشترك
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">الهاتف</dt>
              <dd dir="ltr" className="text-end text-foreground">
                {customer.phone}
              </dd>
              {customer.phone2 && (
                <>
                  <dt className="text-muted-foreground">هاتف إضافي</dt>
                  <dd dir="ltr" className="text-end text-foreground">
                    {customer.phone2}
                  </dd>
                </>
              )}
              <dt className="text-muted-foreground">العنوان</dt>
              <dd className="text-end text-foreground">{customer.address}</dd>
              <dt className="text-muted-foreground">رقم الشقة/الوحدة</dt>
              <dd className="text-end text-foreground">{customer.unitLabel}</dd>
              <dt className="text-muted-foreground">تاريخ التسجيل</dt>
              <dd className="text-end text-foreground">
                {customer.createdAt.toLocaleDateString("en-CA")}
              </dd>
            </dl>
            {customer.notes && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="mt-1 text-sm text-foreground">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              البناء
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">الاسم</dt>
              <dd className="text-end text-foreground">
                {customer.building.name}
              </dd>
              <dt className="text-muted-foreground">العنوان</dt>
              <dd className="text-end text-foreground">
                {customer.building.address}
              </dd>
              <dt className="text-muted-foreground">المنطقة</dt>
              <dd className="text-end text-foreground">
                {customer.building.area}
              </dd>
              <dt className="text-muted-foreground">نقطة التوزيع</dt>
              <dd className="text-end text-foreground">
                {customer.building.distributionPoint.name}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CustomerSubscriptionSummary
          customerId={customer.id}
          subscription={subscription}
          activePlans={activePlans}
        />
        <CustomerNetworkSummary
          customerId={customer.id}
          assignment={networkAssignment}
          networkTree={networkTree}
        />
      </div>

      <CustomerPaymentsSummary
        customerId={customer.id}
        payments={recentPayments}
        totalPaidSyp={totalPaidSyp}
        debtSyp={balance.debtSyp}
        subscriptions={subscriptionHistory}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CustomerTicketsSummary tickets={tickets} />
        <CustomerActivitySummary logs={activity} />
      </div>
    </div>
  );
}
