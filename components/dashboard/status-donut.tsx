"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";

interface StatusDonutProps {
  active: number;
  suspended: number;
  expired: number;
}

const chartConfig = {
  active: { label: "فعال", color: "var(--status-good)" },
  suspended: { label: "موقوف", color: "var(--status-critical)" },
  expired: { label: "منتهي", color: "var(--status-warning)" },
} satisfies ChartConfig;

export function StatusDonut({ active, suspended, expired }: StatusDonutProps) {
  const total = active + suspended + expired;
  const segments = [
    { key: "active", label: "فعال", value: active, color: "var(--status-good)" },
    {
      key: "suspended",
      label: "موقوف",
      value: suspended,
      color: "var(--status-critical)",
    },
    {
      key: "expired",
      label: "منتهي",
      value: expired,
      color: "var(--status-warning)",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>المشتركين حسب الحالة</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ChartContainer config={chartConfig} className="aspect-square h-40 w-40">
            <PieChart>
              <Pie
                data={segments}
                dataKey="value"
                nameKey="key"
                innerRadius={48}
                outerRadius={72}
                strokeWidth={2}
                stroke="var(--card)"
                isAnimationActive={false}
              >
                {segments.map((segment) => (
                  <Cell key={segment.key} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {formatNumber(total)}
            </span>
            <span className="text-xs text-muted-foreground">إجمالي</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-3">
          {segments.map((segment) => (
            <li key={segment.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-muted-foreground">{segment.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatNumber(segment.value)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
