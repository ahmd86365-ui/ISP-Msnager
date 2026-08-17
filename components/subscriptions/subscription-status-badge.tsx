import type { SubscriptionStatus } from "@prisma/client";

import { StatusTag } from "@/components/shared/status-tag";
import { SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_STYLE } from "@/lib/labels";

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const style = SUBSCRIPTION_STATUS_STYLE[status];
  return (
    <StatusTag
      color={style.color}
      tint={style.tint}
      label={SUBSCRIPTION_STATUS_LABELS[status]}
    />
  );
}
