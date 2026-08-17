import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PopularPlan } from "@/lib/dashboard/queries";

export function PopularPlans({ plans }: { plans: PopularPlan[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>أسرع الباقات استخداماً</CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            لا توجد اشتراكات فعالة بعد
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {plans.map((plan) => (
              <li key={plan.planId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{plan.name}</span>
                  <span className="font-semibold tabular-nums text-chart-1">
                    {plan.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${plan.percentage}%` }}
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
