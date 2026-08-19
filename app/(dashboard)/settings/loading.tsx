import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-9 flex-1 sm:max-w-xs" />
            <Skeleton className="h-9 sm:w-40" />
            <Skeleton className="h-9 sm:w-36" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
