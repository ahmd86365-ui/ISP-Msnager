import type { Role } from "@prisma/client";
import { getUnreadNotificationCount, listRecentNotifications } from "@/lib/notifications/queries";
import { HeaderUser } from "./header-user";
import { NotificationsMenu } from "./notifications-menu";
import { MobileNav } from "./mobile-nav";
import { GlobalSearch } from "./global-search";

export async function Header({
  user,
}: {
  user: { id: string; name: string; role: Role };
}) {
  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadNotificationCount(user.id),
    listRecentNotifications(user.id),
  ]);

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3 lg:px-6">
      <HeaderUser name={user.name} role={user.role} />
      <div className="flex items-center gap-1">
        <GlobalSearch />
        <NotificationsMenu unreadCount={unreadCount} items={recentNotifications} />
        <MobileNav user={user} />
      </div>
    </header>
  );
}
