"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeArabic } from "@/lib/format";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";

export function NotificationsMenu({
  unreadCount,
  items,
}: {
  unreadCount: number;
  items: NotificationItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markOne(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

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
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between gap-2 px-1">
          <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={markAll}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              تعيين الكل كمقروء
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            لا توجد إشعارات
          </p>
        ) : (
          <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
            {items.map((item) => {
              const rowBody = (
                <div className="flex items-start gap-2">
                  {!item.isRead && (
                    <button
                      type="button"
                      aria-label="تعيين كمقروء"
                      disabled={isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        markOne(item.id);
                      }}
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary hover:ring-2 hover:ring-primary/30"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {formatRelativeArabic(item.createdAt)}
                    </p>
                  </div>
                </div>
              );

              const rowClassName = `rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted/70 ${
                item.isRead ? "" : "bg-primary/5"
              }`;

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (!item.isRead) markOne(item.id);
                  }}
                  className={rowClassName}
                >
                  {rowBody}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markOne(item.id)}
                  disabled={item.isRead || isPending}
                  className={`w-full ${rowClassName} disabled:cursor-default`}
                >
                  {rowBody}
                </button>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs text-muted-foreground"
          nativeButton={false}
          render={<Link href="/notifications" />}
        >
          عرض جميع الإشعارات
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
