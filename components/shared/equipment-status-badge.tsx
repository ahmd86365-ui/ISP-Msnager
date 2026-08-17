import type { EquipmentStatus } from "@prisma/client";

import { StatusTag } from "@/components/shared/status-tag";
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_STYLE } from "@/lib/labels";

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const style = EQUIPMENT_STATUS_STYLE[status];
  return (
    <StatusTag color={style.color} tint={style.tint} label={EQUIPMENT_STATUS_LABELS[status]} />
  );
}
