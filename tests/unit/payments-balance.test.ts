import { describe, expect, it } from "vitest";

import {
  computeDebtSyp,
  sumDueSubscriptions,
  sumNonVoidedPayments,
} from "@/lib/payments/balance";

describe("sumNonVoidedPayments", () => {
  it("sums only non-voided payments", () => {
    const total = sumNonVoidedPayments([
      { amountSyp: 50000, isVoided: false },
      { amountSyp: 30000, isVoided: true },
      { amountSyp: 20000, isVoided: false },
    ]);
    expect(total).toBe(70000);
  });

  it("returns 0 when every payment is voided", () => {
    const total = sumNonVoidedPayments([
      { amountSyp: 50000, isVoided: true },
      { amountSyp: 30000, isVoided: true },
    ]);
    expect(total).toBe(0);
  });

  it("returns 0 for an empty list", () => {
    expect(sumNonVoidedPayments([])).toBe(0);
  });
});

describe("sumDueSubscriptions", () => {
  const now = new Date("2026-08-17T00:00:00.000Z");

  it("counts subscriptions that have already started", () => {
    const total = sumDueSubscriptions(
      [
        { priceAtSubscriptionSyp: 50000, startDate: new Date("2026-07-01") },
        { priceAtSubscriptionSyp: 80000, startDate: new Date("2026-08-01") },
      ],
      now,
    );
    expect(total).toBe(130000);
  });

  it("excludes subscriptions that have not started yet", () => {
    const total = sumDueSubscriptions(
      [
        { priceAtSubscriptionSyp: 50000, startDate: new Date("2026-07-01") },
        { priceAtSubscriptionSyp: 90000, startDate: new Date("2026-09-01") },
      ],
      now,
    );
    expect(total).toBe(50000);
  });

  it("counts a subscription across all statuses (no proration on cancel)", () => {
    // sumDueSubscriptions doesn't take status into account at all — a
    // cancelled/expired subscription's price still counted as due once its
    // period started, matching the documented no-FIFO assumption.
    const total = sumDueSubscriptions(
      [{ priceAtSubscriptionSyp: 80000, startDate: new Date("2026-08-01") }],
      now,
    );
    expect(total).toBe(80000);
  });
});

describe("computeDebtSyp", () => {
  it("returns the shortfall when due exceeds paid", () => {
    expect(computeDebtSyp(130000, 80000)).toBe(50000);
  });

  it("returns 0 when paid covers due exactly", () => {
    expect(computeDebtSyp(80000, 80000)).toBe(0);
  });

  it("returns 0 (never negative) on overpayment", () => {
    expect(computeDebtSyp(50000, 90000)).toBe(0);
  });
});

describe("customer balance (end-to-end of the agreed rule)", () => {
  it("combines due subscriptions and non-voided payments into the outstanding debt", () => {
    const now = new Date("2026-08-17T00:00:00.000Z");
    const subscriptions = [
      { priceAtSubscriptionSyp: 50000, startDate: new Date("2026-06-01") },
      { priceAtSubscriptionSyp: 80000, startDate: new Date("2026-08-01") },
    ];
    const payments = [
      { amountSyp: 50000, isVoided: false },
      { amountSyp: 30000, isVoided: false },
      // Voided — a customer who paid then had it voided (e.g. bounced
      // transfer) must not have that amount reduce their debt.
      { amountSyp: 80000, isVoided: true },
    ];

    const totalDueSyp = sumDueSubscriptions(subscriptions, now);
    const totalPaidSyp = sumNonVoidedPayments(payments);
    const debtSyp = computeDebtSyp(totalDueSyp, totalPaidSyp);

    expect(totalDueSyp).toBe(130000);
    expect(totalPaidSyp).toBe(80000);
    expect(debtSyp).toBe(50000);
  });
});
