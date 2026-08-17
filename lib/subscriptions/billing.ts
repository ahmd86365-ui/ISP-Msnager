import type { BillingPeriod } from "@prisma/client";

// Calendar-based period math (not a fixed day count) so a MONTHLY plan
// started on the 31st behaves the way a human billing clerk expects.
export function computeSubscriptionEndDate(
  startDate: Date,
  billingPeriod: BillingPeriod,
): Date {
  const end = new Date(startDate);

  switch (billingPeriod) {
    case "MONTHLY":
      end.setMonth(end.getMonth() + 1);
      break;
    case "QUARTERLY":
      end.setMonth(end.getMonth() + 3);
      break;
    case "SEMI_ANNUAL":
      end.setMonth(end.getMonth() + 6);
      break;
    case "ANNUAL":
      end.setFullYear(end.getFullYear() + 1);
      break;
  }

  return end;
}
