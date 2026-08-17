import { describe, expect, it } from "vitest";

import { createPaymentSchema, voidPaymentSchema } from "@/lib/payments/schema";

const VALID_PAYMENT = {
  customerId: "cust_123",
  subscriptionId: "sub_123",
  amountSyp: "50000",
  method: "CASH",
  paidAt: "2026-08-17",
  reference: "REF-1",
  notes: "",
};

describe("createPaymentSchema", () => {
  it("accepts a valid payment and coerces the amount/date", () => {
    const result = createPaymentSchema.safeParse(VALID_PAYMENT);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amountSyp).toBe(50000);
      expect(result.data.paidAt).toBeInstanceOf(Date);
    }
  });

  it("accepts a payment with no subscription linked", () => {
    const result = createPaymentSchema.safeParse({
      ...VALID_PAYMENT,
      subscriptionId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subscriptionId).toBeUndefined();
    }
  });

  it("rejects an amount of 0", () => {
    const result = createPaymentSchema.safeParse({ ...VALID_PAYMENT, amountSyp: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative amount", () => {
    const result = createPaymentSchema.safeParse({ ...VALID_PAYMENT, amountSyp: "-1000" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer amount", () => {
    const result = createPaymentSchema.safeParse({ ...VALID_PAYMENT, amountSyp: "500.5" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing customerId", () => {
    const result = createPaymentSchema.safeParse({ ...VALID_PAYMENT, customerId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid payment method", () => {
    const result = createPaymentSchema.safeParse({ ...VALID_PAYMENT, method: "CHEQUE" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid paidAt date", () => {
    const result = createPaymentSchema.safeParse({
      ...VALID_PAYMENT,
      paidAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("voidPaymentSchema", () => {
  it("accepts an empty void reason", () => {
    const result = voidPaymentSchema.safeParse({ voidReason: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.voidReason).toBeUndefined();
    }
  });

  it("accepts a provided void reason", () => {
    const result = voidPaymentSchema.safeParse({ voidReason: "دفعة مكررة بالخطأ" });
    expect(result.success).toBe(true);
  });
});
