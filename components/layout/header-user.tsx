import { User } from "lucide-react";

import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/labels";

export function HeaderUser({ name, role }: { name: string; role: Role }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <User className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {ROLE_LABELS[role]}
        </p>
      </div>
    </div>
  );
}
