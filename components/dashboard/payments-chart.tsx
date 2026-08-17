"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MOCK_PAYMENTS_TREND } from "@/lib/dashboard/mock-payments-trend";
import { formatNumber } from "@/lib/format";

const chartConfig = {
  amountSyp: {
    label: "الدفعات",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function PaymentsChart() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>الدفعات خلال آخر 6 أشهر</CardTitle>
        <Badge variant="outline" className="font-normal text-muted-foreground">
          بيانات تجريبية
        </Badge>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
          <AreaChart data={MOCK_PAYMENTS_TREND} margin={{ left: 4, right: 4 }}>
            <defs>
              <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
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
              fill="url(#paymentsFill)"
              dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
