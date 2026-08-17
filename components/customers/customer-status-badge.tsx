import type { CustomerStatus } from "@prisma/client";

import { StatusTag } from "@/components/shared/status-tag";

const CUSTOMER_STATUS_STYLE: Record<CustomerStatus, { color: string; tint: string; label: string }> = {
  ACTIVE: { color: "var(--status-good)", tint: "bg-status-good/10", label: "نشط" },
  INACTIVE: { color: "var(--status-warning)", tint: "bg-status-warning/15", label: "غير نشط" },
  ARCHIVED: { color: "var(--muted-foreground)", tint: "bg-muted", label: "مؤرشف" },
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const style = CUSTOMER_STATUS_STYLE[status];
  return <StatusTag color={style.color} tint={style.tint} label={style.label} />;
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  ARCHIVED: "مؤرشف",
};
