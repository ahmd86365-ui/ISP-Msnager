import { describe, expect, it } from "vitest";

import { computeAverageResolutionHours } from "@/lib/reports/resolution-time";

describe("computeAverageResolutionHours", () => {
  it("returns null when there are no resolved tickets", () => {
    expect(computeAverageResolutionHours([])).toBeNull();
  });

  it("computes the average in hours across multiple tickets", () => {
    const result = computeAverageResolutionHours([
      { createdAt: new Date(2026, 0, 1, 0, 0), resolvedAt: new Date(2026, 0, 1, 2, 0) }, // 2h
      { createdAt: new Date(2026, 0, 1, 0, 0), resolvedAt: new Date(2026, 0, 1, 6, 0) }, // 6h
    ]);
    expect(result).toBe(4);
  });

  it("handles a single ticket", () => {
    const result = computeAverageResolutionHours([
      { createdAt: new Date(2026, 0, 1, 0, 0), resolvedAt: new Date(2026, 0, 1, 12, 0) },
    ]);
    expect(result).toBe(12);
  });

  it("never returns a negative average even if resolvedAt precedes createdAt", () => {
    const result = computeAverageResolutionHours([
      { createdAt: new Date(2026, 0, 1, 12, 0), resolvedAt: new Date(2026, 0, 1, 0, 0) },
    ]);
    expect(result).toBe(0);
  });
});
