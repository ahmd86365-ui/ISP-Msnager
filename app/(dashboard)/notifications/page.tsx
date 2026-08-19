import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount, listAllNotifications } from "@/lib/notifications/queries";
import { formatNumber } from "@/lib/format";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const session = await auth();
  const userId = session!.user.id;

  const [{ notifications, total, pageCount, pageSize }, unreadCount] = await Promise.all([
    listAllNotifications(userId, page),
    getUnreadNotificationCount(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">الإشعارات</h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(total)} إشعار إجمالاً
          {unreadCount > 0 ? ` · ${formatNumber(unreadCount)} غير مقروء` : ""}
        </p>
      </div>

      <Card>
        <CardContent>
          <NotificationsList notifications={notifications} unreadCount={unreadCount} />
          {total > 0 && (
            <div className="mt-4">
              <PaginationControls
                page={page}
                pageCount={pageCount}
                total={total}
                pageSize={pageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
