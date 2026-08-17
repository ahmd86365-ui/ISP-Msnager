import type { AuditLog, User } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeArabic } from "@/lib/format";

type ActivityRow = AuditLog & { actor: Pick<User, "name"> | null };

export function CustomerActivitySummary({ logs }: { logs: ActivityRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>آخر النشاطات</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد نشاط مسجّل بعد.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-foreground">{log.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {log.actor?.name ?? "النظام"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeArabic(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
