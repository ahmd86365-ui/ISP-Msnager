import "server-only";

import { prisma } from "@/lib/prisma";

const RECENT_LIMIT = 8;
const PAGE_SIZE = 20;

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  href: string | null;
}

// Every relatedEntityType this module actually writes (see service.ts) maps
// to an existing detail page — no new routes. Anything unrecognized (or
// missing) simply isn't clickable.
function buildHref(relatedEntityType: string | null, relatedEntityId: string | null): string | null {
  if (!relatedEntityType || !relatedEntityId) {
    return null;
  }
  switch (relatedEntityType) {
    case "Ticket":
      return `/tickets/${relatedEntityId}`;
    case "Customer":
      return `/customers/${relatedEntityId}`;
    case "Subscription":
      return `/subscriptions/${relatedEntityId}`;
    default:
      return null;
  }
}

function toItem(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.isRead,
    createdAt: row.createdAt,
    href: buildHref(row.relatedEntityType, row.relatedEntityId),
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { recipientId: userId, isRead: false } });
}

// Feeds the header bell dropdown — a short, recent slice, not the full list.
export async function listRecentNotifications(userId: string): Promise<NotificationItem[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: RECENT_LIMIT,
  });
  return rows.map(toItem);
}

export interface ListAllNotificationsResult {
  notifications: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// Feeds the "view all notifications" page.
export async function listAllNotifications(
  userId: string,
  page = 1,
): Promise<ListAllNotificationsResult> {
  const safePage = Math.max(1, page);
  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where: { recipientId: userId } }),
  ]);

  return {
    notifications: rows.map(toItem),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
