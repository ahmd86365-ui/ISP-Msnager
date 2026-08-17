"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeArabic } from "@/lib/format";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
}

export function NotificationsMenu({
  unreadCount,
  items,
}: {
  unreadCount: number;
  items: NotificationItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="الإشعارات" className="relative" />
        }
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute end-1.5 top-1.5 flex size-2 rounded-full bg-status-critical" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            لا توجد إشعارات جديدة
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <div key={item.id} className="rounded-md px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {item.body}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  {formatRelativeArabic(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
