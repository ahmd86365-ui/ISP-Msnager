import { describe, expect, it } from "vitest";

import { subscriptionPlanSchema } from "@/lib/subscriptions/schema";

describe("subscriptionPlanSchema", () => {
  it("accepts a valid payload with optional notes", () => {
    const result = subscriptionPlanSchema.safeParse({
      planId: "plan_123",
      notes: "ملاحظة",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with empty notes", () => {
    const result = subscriptionPlanSchema.safeParse({ planId: "plan_123", notes: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBeUndefined();
    }
  });

  it("rejects a missing planId", () => {
    const result = subscriptionPlanSchema.safeParse({ planId: "", notes: "" });
    expect(result.success).toBe(false);
  });
});
