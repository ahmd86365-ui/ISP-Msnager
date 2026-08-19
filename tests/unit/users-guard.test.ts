import { describe, expect, it } from "vitest";

import { canAssignRole, canManageTargetUser, checkCanDeactivate } from "@/lib/users/guard";

describe("canManageTargetUser", () => {
  it("allows an ADMIN to manage a non-OWNER account", () => {
    expect(canManageTargetUser("ADMIN", "SUPPORT")).toBe(true);
    expect(canManageTargetUser("ADMIN", "ADMIN")).toBe(true);
  });

  it("blocks an ADMIN from managing an OWNER account", () => {
    expect(canManageTargetUser("ADMIN", "OWNER")).toBe(false);
  });

  it("allows an OWNER to manage any account including another OWNER", () => {
    expect(canManageTargetUser("OWNER", "OWNER")).toBe(true);
    expect(canManageTargetUser("OWNER", "ADMIN")).toBe(true);
  });
});

describe("canAssignRole", () => {
  it("blocks a non-OWNER from assigning the OWNER role", () => {
    expect(canAssignRole("ADMIN", "OWNER")).toBe(false);
  });

  it("allows an OWNER to assign the OWNER role", () => {
    expect(canAssignRole("OWNER", "OWNER")).toBe(true);
  });

  it("allows anyone to assign a non-OWNER role", () => {
    expect(canAssignRole("ADMIN", "SUPPORT")).toBe(true);
    expect(canAssignRole("ADMIN", "TECHNICIAN")).toBe(true);
  });
});

describe("checkCanDeactivate", () => {
  it("blocks deactivating your own account", () => {
    const result = checkCanDeactivate({
      actorId: "u1",
      targetId: "u1",
      targetRole: "ADMIN",
      activeOwnerCount: 2,
    });
    expect(result.ok).toBe(false);
  });

  it("blocks deactivating the last active OWNER", () => {
    const result = checkCanDeactivate({
      actorId: "actor",
      targetId: "owner1",
      targetRole: "OWNER",
      activeOwnerCount: 1,
    });
    expect(result.ok).toBe(false);
  });

  it("allows deactivating an OWNER when another active OWNER remains", () => {
    const result = checkCanDeactivate({
      actorId: "actor",
      targetId: "owner1",
      targetRole: "OWNER",
      activeOwnerCount: 2,
    });
    expect(result.ok).toBe(true);
  });

  it("allows deactivating a non-OWNER account by someone else", () => {
    const result = checkCanDeactivate({
      actorId: "actor",
      targetId: "target",
      targetRole: "SUPPORT",
      activeOwnerCount: 1,
    });
    expect(result.ok).toBe(true);
  });
});
