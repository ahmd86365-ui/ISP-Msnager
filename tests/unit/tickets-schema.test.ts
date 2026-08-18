import { describe, expect, it } from "vitest";

import {
  addTicketCommentSchema,
  assignTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
} from "@/lib/tickets/schema";

const VALID_TICKET = {
  customerId: "cust_123",
  title: "انقطاع كامل عن الخدمة",
  description: "المشترك يبلغ عن انقطاع الإنترنت منذ الصباح.",
  category: "INTERNET_DOWN",
  priority: "HIGH",
  assignedTechnicianId: "",
  notes: "",
};

describe("createTicketSchema", () => {
  it("accepts a valid ticket", () => {
    const result = createTicketSchema.safeParse(VALID_TICKET);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("HIGH");
      expect(result.data.assignedTechnicianId).toBeUndefined();
    }
  });

  it("accepts a ticket with no customer (general network ticket)", () => {
    const result = createTicketSchema.safeParse({ ...VALID_TICKET, customerId: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerId).toBeUndefined();
    }
  });

  it("defaults priority to MEDIUM when omitted", () => {
    const withoutPriority: Partial<typeof VALID_TICKET> = { ...VALID_TICKET };
    delete withoutPriority.priority;
    const result = createTicketSchema.safeParse(withoutPriority);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
    }
  });

  it("rejects an empty title", () => {
    const result = createTicketSchema.safeParse({ ...VALID_TICKET, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty description", () => {
    const result = createTicketSchema.safeParse({ ...VALID_TICKET, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = createTicketSchema.safeParse({ ...VALID_TICKET, category: "UNKNOWN" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = createTicketSchema.safeParse({ ...VALID_TICKET, priority: "URGENT" });
    expect(result.success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    const result = createTicketSchema.safeParse({
      ...VALID_TICKET,
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTicketStatusSchema", () => {
  it("accepts every valid status", () => {
    for (const status of ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]) {
      expect(updateTicketStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an invalid status", () => {
    const result = updateTicketStatusSchema.safeParse({ status: "ARCHIVED" });
    expect(result.success).toBe(false);
  });
});

describe("assignTicketSchema", () => {
  it("accepts an empty technician (unassign)", () => {
    const result = assignTicketSchema.safeParse({ assignedTechnicianId: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.assignedTechnicianId).toBeUndefined();
    }
  });

  it("accepts a provided technician id", () => {
    const result = assignTicketSchema.safeParse({ assignedTechnicianId: "user_123" });
    expect(result.success).toBe(true);
  });
});

describe("addTicketCommentSchema", () => {
  it("accepts a non-empty comment", () => {
    const result = addTicketCommentSchema.safeParse({ body: "تم إرسال فني للمعاينة." });
    expect(result.success).toBe(true);
  });

  it("rejects an empty comment", () => {
    const result = addTicketCommentSchema.safeParse({ body: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only comment", () => {
    const result = addTicketCommentSchema.safeParse({ body: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a comment over 2000 characters", () => {
    const result = addTicketCommentSchema.safeParse({ body: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
