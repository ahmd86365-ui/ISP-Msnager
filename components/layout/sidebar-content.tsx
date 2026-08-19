import { LogOut, Wifi } from "lucide-react";

import type { Role } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/lib/labels";
import { logoutAction } from "@/lib/auth/actions";
import { SidebarNav } from "./sidebar-nav";

interface SidebarContentProps {
  user: { name: string; role: Role };
  onNavigate?: () => void;
}

export function SidebarContent({ user, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="text-lg font-semibold">ISP Manager</span>
        <Wifi className="size-5 text-sidebar-foreground/80" />
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-auto border-t border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>

        <Separator className="my-2 bg-sidebar-border" />

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-status-critical/80 transition-colors hover:bg-status-critical/10 hover:text-status-critical"
          >
            <LogOut className="size-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </div>
  );
}
