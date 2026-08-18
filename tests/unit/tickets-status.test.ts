import { describe, expect, it } from "vitest";

import { computeTicketStatusChange } from "@/lib/tickets/status";

const NOW = new Date(2026, 0, 15, 12, 0, 0);
const ACTOR_ID = "user_123";

describe("computeTicketStatusChange", () => {
  it("stamps resolvedAt/resolvedById when moving to RESOLVED", () => {
    const change = computeTicketStatusChange("RESOLVED", ACTOR_ID, NOW);
    expect(change.status).toBe("RESOLVED");
    expect(change.resolvedAt).toEqual(NOW);
    expect(change.resolvedById).toBe(ACTOR_ID);
  });

  it("stamps resolvedAt/resolvedById when moving to CLOSED", () => {
    const change = computeTicketStatusChange("CLOSED", ACTOR_ID, NOW);
    expect(change.resolvedAt).toEqual(NOW);
    expect(change.resolvedById).toBe(ACTOR_ID);
  });

  it("clears resolvedAt/resolvedById when moving to a non-terminal status", () => {
    for (const status of ["OPEN", "IN_PROGRESS", "WAITING"] as const) {
      const change = computeTicketStatusChange(status, ACTOR_ID, NOW);
      expect(change.resolvedAt).toBeNull();
      expect(change.resolvedById).toBeNull();
    }
  });

  it("defaults `now` to the current time when omitted", () => {
    const before = new Date();
    const change = computeTicketStatusChange("RESOLVED", ACTOR_ID);
    const after = new Date();
    expect(change.resolvedAt).not.toBeNull();
    expect(change.resolvedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(change.resolvedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
