import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HeaderUser } from "./header-user";
import { NotificationsMenu } from "./notifications-menu";
import { MobileNav } from "./mobile-nav";

export async function Header({
  user,
}: {
  user: { id: string; name: string; role: Role };
}) {
  const [unreadCount, recentNotifications] = await Promise.all([
    prisma.notification.count({
      where: { recipientId: user.id, isRead: false },
    }),
    prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, body: true, createdAt: true },
    }),
  ]);

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3 lg:px-6">
      <HeaderUser name={user.name} role={user.role} />
      <div className="flex items-center gap-1">
        <NotificationsMenu unreadCount={unreadCount} items={recentNotifications} />
        <MobileNav user={user} />
      </div>
    </header>
  );
}
