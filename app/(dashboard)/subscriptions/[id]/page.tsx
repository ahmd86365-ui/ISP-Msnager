import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionStatusBadge } from "@/components/subscriptions/subscription-status-badge";
import { SubscriptionHistoryTable } from "@/components/subscriptions/subscription-history-table";
import { ChangePlanDialog } from "@/components/subscriptions/change-plan-dialog";
import {
  getCustomerSubscriptionHistory,
  getSubscriptionById,
} from "@/lib/subscriptions/queries";
import { listActivePlansForSelect } from "@/lib/plans/queries";
import { BILLING_PERIOD_LABELS } from "@/lib/labels";
import { formatSyp } from "@/lib/format";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscription = await getSubscriptionById(id);

  if (!subscription) {
    notFound();
  }

  const [history, activePlans] = await Promise.all([
    getCustomerSubscriptionHistory(subscription.customerId, subscription.id),
    subscription.status === "ACTIVE" ? listActivePlansForSelect() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">
                {subscription.plan.name}
              </h1>
              <SubscriptionStatusBadge status={subscription.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              المشترك:{" "}
              <Link
                href={`/customers/${subscription.customer.id}`}
                className="text-foreground hover:underline"
              >
                {subscription.customer.fullName}
              </Link>{" "}
              — {subscription.customer.customerNumber}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {subscription.status === "ACTIVE" && (
              <ChangePlanDialog
                customerId={subscription.customerId}
                currentSubscriptionId={subscription.id}
                plans={activePlans}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/customers/${subscription.customerId}`} />}
            >
              <ArrowRight className="size-4" />
              الذهاب لصفحة المشترك
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              تفاصيل الاشتراك
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">الباقة</dt>
              <dd className="text-end text-foreground">{subscription.plan.name}</dd>
              <dt className="text-muted-foreground">السعر وقت الاشتراك</dt>
              <dd className="text-end text-foreground">
                {formatSyp(subscription.priceAtSubscriptionSyp)}
              </dd>
              <dt className="text-muted-foreground">السعر الحالي للباقة</dt>
              <dd className="text-end text-foreground">
                {formatSyp(subscription.plan.priceSyp)}
              </dd>
              <dt className="text-muted-foreground">السرعة</dt>
              <dd dir="ltr" className="text-end text-foreground">
                {subscription.plan.downloadMbps}/{subscription.plan.uploadMbps} Mbps
              </dd>
              <dt className="text-muted-foreground">دورة الفوترة</dt>
              <dd className="text-end text-foreground">
                {BILLING_PERIOD_LABELS[subscription.plan.billingPeriod]}
              </dd>
              <dt className="text-muted-foreground">تاريخ البداية</dt>
              <dd className="text-end text-foreground">
                {subscription.startDate.toLocaleDateString("en-CA")}
              </dd>
              <dt className="text-muted-foreground">تاريخ النهاية</dt>
              <dd className="text-end text-foreground">
                {subscription.endDate.toLocaleDateString("en-CA")}
              </dd>
              <dt className="text-muted-foreground">الحالة</dt>
              <dd className="text-end text-foreground">
                <SubscriptionStatusBadge status={subscription.status} />
              </dd>
            </dl>
            {subscription.notes && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="mt-1 text-sm text-foreground">{subscription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              المشترك
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">الاسم</dt>
              <dd className="text-end text-foreground">
                <Link
                  href={`/customers/${subscription.customer.id}`}
                  className="hover:underline"
                >
                  {subscription.customer.fullName}
                </Link>
              </dd>
              <dt className="text-muted-foreground">رقم المشترك</dt>
              <dd className="text-end text-foreground">
                {subscription.customer.customerNumber}
              </dd>
              <dt className="text-muted-foreground">الهاتف</dt>
              <dd dir="ltr" className="text-end text-foreground">
                {subscription.customer.phone}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-heading text-base font-medium text-foreground">
            السجل التاريخي لاشتراكات المشترك
          </h2>
          <SubscriptionHistoryTable subscriptions={history} />
        </CardContent>
      </Card>
    </div>
  );
}
