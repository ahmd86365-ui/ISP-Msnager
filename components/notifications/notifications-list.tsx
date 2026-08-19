"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatRelativeArabic } from "@/lib/format";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";

export function NotificationsList({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
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
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" disabled={isPending} onClick={markAll}>
            تعيين الكل كمقروء
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">لا توجد إشعارات بعد.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {notifications.map((item) => {
            const rowBody = (
              <div className="flex items-start gap-3">
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
                    className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary hover:ring-2 hover:ring-primary/30"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {formatRelativeArabic(item.createdAt)}
                  </p>
                </div>
              </div>
            );

            const rowClassName = `rounded-lg border px-3 py-2.5 text-start transition-colors hover:bg-muted/50 ${
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
    </div>
  );
}
