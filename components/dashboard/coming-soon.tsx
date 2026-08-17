import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">لوحة التحكم</p>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </div>
          <p className="text-base font-medium text-foreground">
            هذا القسم قيد الإنشاء
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            سيتم بناء صفحة {title} في خطوة لاحقة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
