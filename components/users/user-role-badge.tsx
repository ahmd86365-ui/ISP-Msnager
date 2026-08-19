import type { Role } from "@prisma/client";

import { StatusTag } from "@/components/shared/status-tag";
import { ROLE_LABELS, ROLE_STYLE } from "@/lib/labels";

export function UserRoleBadge({ role }: { role: Role }) {
  const style = ROLE_STYLE[role];
  return <StatusTag color={style.color} tint={style.tint} label={ROLE_LABELS[role]} />;
}
