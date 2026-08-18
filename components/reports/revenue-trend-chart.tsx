"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";
import type { MonthlyRevenuePoint } from "@/lib/reports/queries";

// Same visual style as components/dashboard/payments-chart.tsx, but fed real
// Payment data from lib/reports/queries.ts's getMonthlyRevenueTrend — the
// dashboard's mock chart is intentionally left untouched (out of scope).
const chartConfig = {
  amountSyp: {
    label: "الإيرادات",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RevenueTrendChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const hasData = data.some((point) => point.amountSyp > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>الإيرادات خلال آخر 6 أشهر</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <AreaChart data={data} margin={{ left: 4, right: 4 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${formatNumber(Number(value))} ل.س`}
                  />
                }
              />
              <Area
                dataKey="amountSyp"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            لا توجد دفعات مسجّلة خلال آخر 6 أشهر
          </p>
        )}
      </CardContent>
    </Card>
  );
}
