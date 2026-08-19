// Pure date calc, kept separate from service.ts so it's directly
// unit-testable without a live database (this project's test environment
// has no DB — see tests/unit/notifications-expiry.test.ts). Mirrors the
// lib/payments/balance.ts / lib/subscriptions/billing.ts split.

export const EXPIRING_SOON_WINDOW_DAYS = 3;

export type SubscriptionExpiryState = "EXPIRING_SOON" | "EXPIRED" | "NONE";

// Only meaningful for an ACTIVE subscription — callers filter by status
// before calling this (see lib/notifications/service.ts). Deliberately
// read-only: this never changes Subscription.status, it only classifies
// endDate against "now" for notification purposes.
export function classifySubscriptionExpiry(
  endDate: Date,
  now: Date = new Date(),
): SubscriptionExpiryState {
  if (endDate.getTime() < now.getTime()) {
    return "EXPIRED";
  }
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + EXPIRING_SOON_WINDOW_DAYS);
  if (endDate.getTime() <= windowEnd.getTime()) {
    return "EXPIRING_SOON";
  }
  return "NONE";
}
