import { describe, expect, it } from "vitest";

import { computeSubscriptionEndDate } from "@/lib/subscriptions/billing";

// Assertions compare local calendar-date components (year/month/day), not
// toISOString(): the function does calendar-based math via setMonth/
// setFullYear, which is wall-clock/local-time arithmetic. Comparing UTC
// ISO strings across a DST boundary (e.g. January -> April) would fail
// because the UTC offset itself changes, even though the local calendar
// date is exactly right.
function expectSameLocalDate(date: Date, year: number, month: number, day: number) {
  expect(date.getFullYear()).toBe(year);
  expect(date.getMonth()).toBe(month);
  expect(date.getDate()).toBe(day);
}

describe("computeSubscriptionEndDate", () => {
  it("adds one month for MONTHLY", () => {
    const start = new Date(2026, 0, 15);
    const end = computeSubscriptionEndDate(start, "MONTHLY");
    expectSameLocalDate(end, 2026, 1, 15);
  });

  it("adds three months for QUARTERLY", () => {
    const start = new Date(2026, 0, 15);
    const end = computeSubscriptionEndDate(start, "QUARTERLY");
    expectSameLocalDate(end, 2026, 3, 15);
  });

  it("adds six months for SEMI_ANNUAL", () => {
    const start = new Date(2026, 0, 15);
    const end = computeSubscriptionEndDate(start, "SEMI_ANNUAL");
    expectSameLocalDate(end, 2026, 6, 15);
  });

  it("adds one year for ANNUAL", () => {
    const start = new Date(2026, 0, 15);
    const end = computeSubscriptionEndDate(start, "ANNUAL");
    expectSameLocalDate(end, 2027, 0, 15);
  });

  it("does not mutate the input start date", () => {
    const start = new Date(2026, 0, 15);
    const startCopy = new Date(start);
    computeSubscriptionEndDate(start, "MONTHLY");
    expect(start.getTime()).toBe(startCopy.getTime());
  });
});
