import Link from "next/link";
import type { Plan, Subscription } from "@prisma/client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusTag } from "@/components/shared/status-tag";
import { AddSubscriptionDialog } from "@/components/subscriptions/add-subscription-dialog";
import { ChangePlanDialog } from "@/components/subscriptions/change-plan-dialog";
import type { PlanOption } from "@/components/subscriptions/subscription-plan-form";
import { SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_STYLE } from "@/lib/labels";
import { formatSyp } from "@/lib/format";

type SubscriptionWithPlan = Subscription & {
  plan: Pick<Plan, "name" | "downloadMbps" | "uploadMbps">;
};

export function CustomerSubscriptionSummary({
  customerId,
  subscription,
  activePlans,
}: {
  customerId: string;
  subscription: SubscriptionWithPlan | null;
  activePlans: PlanOption[];
}) {
  const isActive = subscription?.status === "ACTIVE";

  return (
    <Card>
      <CardHeader>
        <CardTitle>الاشتراك</CardTitle>
        <CardAction>
          {isActive && subscription ? (
            <ChangePlanDialog
              customerId={customerId}
              currentSubscriptionId={subscription.id}
              plans={activePlans}
            />
          ) : (
            <AddSubscriptionDialog customerId={customerId} plans={activePlans} />
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        {!subscription ? (
          <p className="text-sm text-muted-foreground">
            لا يوجد اشتراك مسجّل لهذا المشترك بعد.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">
                {subscription.plan.name}
              </span>
              <StatusTag
                color={SUBSCRIPTION_STATUS_STYLE[subscription.status].color}
                tint={SUBSCRIPTION_STATUS_STYLE[subscription.status].tint}
                label={SUBSCRIPTION_STATUS_LABELS[subscription.status]}
              />
            </div>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">السرعة</dt>
              <dd dir="ltr" className="text-end text-foreground">
                {subscription.plan.downloadMbps}/{subscription.plan.uploadMbps} Mbps
              </dd>
              <dt className="text-muted-foreground">السعر</dt>
              <dd className="text-end text-foreground">
                {formatSyp(subscription.priceAtSubscriptionSyp)}
              </dd>
              <dt className="text-muted-foreground">تاريخ البدء</dt>
              <dd className="text-end text-foreground">
                {subscription.startDate.toLocaleDateString("en-CA")}
              </dd>
              <dt className="text-muted-foreground">تاريخ الانتهاء</dt>
              <dd className="text-end text-foreground">
                {subscription.endDate.toLocaleDateString("en-CA")}
              </dd>
            </dl>
            <Link
              href={`/subscriptions/${subscription.id}`}
              className="text-sm text-primary hover:underline"
            >
              عرض تفاصيل الاشتراك والسجل التاريخي
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
