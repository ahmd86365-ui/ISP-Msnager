import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { ReportBreakdownItem } from "@/lib/reports/queries";

// Generalized from components/dashboard/popular-plans.tsx's label/%/bar
// pattern — reused here for every category breakdown (payments by method,
// tickets by priority/category/technician, devices by type/status) instead
// of introducing a new chart type per breakdown.
export function ReportBreakdownList({
  title,
  items,
  emptyMessage,
  formatValue = formatNumber,
}: {
  title: string;
  items: ReportBreakdownItem[];
  emptyMessage: string;
  formatValue?: (value: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums text-chart-1">
                    {formatValue(item.value)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
