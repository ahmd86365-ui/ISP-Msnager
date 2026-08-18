"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/format";
import type { WeeklyTicketPoint } from "@/lib/reports/queries";

const chartConfig = {
  count: {
    label: "بلاغات جديدة",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function TicketsTrendChart({ data }: { data: WeeklyTicketPoint[] }) {
  const hasData = data.some((point) => point.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>الأعطال الجديدة خلال آخر 8 أسابيع</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <BarChart data={data} margin={{ left: 4, right: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="weekLabel" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => formatNumber(Number(value))} />}
              />
              <Bar dataKey="count" fill="var(--chart-4)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            لا توجد بلاغات جديدة خلال آخر 8 أسابيع
          </p>
        )}
      </CardContent>
    </Card>
  );
}
