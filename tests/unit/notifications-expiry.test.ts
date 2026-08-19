import { describe, expect, it } from "vitest";

import { classifySubscriptionExpiry } from "@/lib/notifications/expiry";

const NOW = new Date(2026, 0, 15, 12, 0, 0);

describe("classifySubscriptionExpiry", () => {
  it("returns EXPIRED when endDate is in the past", () => {
    const endDate = new Date(2026, 0, 14, 12, 0, 0);
    expect(classifySubscriptionExpiry(endDate, NOW)).toBe("EXPIRED");
  });

  it("returns EXPIRED when endDate is exactly now minus a moment", () => {
    const endDate = new Date(NOW.getTime() - 1000);
    expect(classifySubscriptionExpiry(endDate, NOW)).toBe("EXPIRED");
  });

  it("returns EXPIRING_SOON when endDate is within the 3-day window", () => {
    const endDate = new Date(2026, 0, 17, 12, 0, 0); // +2 days
    expect(classifySubscriptionExpiry(endDate, NOW)).toBe("EXPIRING_SOON");
  });

  it("returns EXPIRING_SOON at exactly the edge of the window", () => {
    const endDate = new Date(2026, 0, 18, 12, 0, 0); // +3 days exactly
    expect(classifySubscriptionExpiry(endDate, NOW)).toBe("EXPIRING_SOON");
  });

  it("returns NONE when endDate is beyond the window", () => {
    const endDate = new Date(2026, 0, 20, 12, 0, 0); // +5 days
    expect(classifySubscriptionExpiry(endDate, NOW)).toBe("NONE");
  });
});
