import { describe, expect, it } from "vitest";

import { planBaseSchema } from "@/lib/plans/schema";

const VALID_PLAN = {
  name: "باقة منزلية 20",
  description: "",
  downloadMbps: "20",
  uploadMbps: "10",
  priceSyp: "150000",
  billingPeriod: "MONTHLY",
};

describe("planBaseSchema", () => {
  it("accepts a valid plan payload and coerces numeric strings", () => {
    const result = planBaseSchema.safeParse(VALID_PLAN);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.downloadMbps).toBe(20);
      expect(result.data.uploadMbps).toBe(10);
      expect(result.data.priceSyp).toBe(150000);
    }
  });

  it("rejects a zero or negative price", () => {
    const result = planBaseSchema.safeParse({ ...VALID_PLAN, priceSyp: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer speed", () => {
    const result = planBaseSchema.safeParse({ ...VALID_PLAN, downloadMbps: "20.5" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative upload speed", () => {
    const result = planBaseSchema.safeParse({ ...VALID_PLAN, uploadMbps: "-5" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid billing period", () => {
    const result = planBaseSchema.safeParse({ ...VALID_PLAN, billingPeriod: "WEEKLY" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = planBaseSchema.safeParse({ ...VALID_PLAN, name: "أ" });
    expect(result.success).toBe(false);
  });
});
