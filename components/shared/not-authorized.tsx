import { ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function NotAuthorized({
  title = "غير مصرح بالوصول",
  message = "هذا القسم متاح فقط لحسابات المالك والمدير.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShieldAlert className="size-6" />
        </div>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
