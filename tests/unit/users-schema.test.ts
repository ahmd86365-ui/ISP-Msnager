import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  usernameSchema,
} from "@/lib/users/schema";

const VALID_USER = {
  name: "أحمد الفني",
  username: "ahmad.tech",
  role: "TECHNICIAN",
  password: "correct-horse",
};

describe("createUserSchema", () => {
  it("accepts a valid user payload", () => {
    expect(createUserSchema.safeParse(VALID_USER).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = createUserSchema.safeParse({ ...VALID_USER, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const result = createUserSchema.safeParse({ ...VALID_USER, role: "SUPERADMIN" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = createUserSchema.safeParse({ ...VALID_USER, name: "أ" });
    expect(result.success).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("rejects a username with spaces or symbols", () => {
    expect(usernameSchema.safeParse("ahmad tech!").success).toBe(false);
  });

  it("accepts a username with letters, numbers, dots, dashes, underscores", () => {
    expect(usernameSchema.safeParse("ahmad_tech-01.b").success).toBe(true);
  });

  it("rejects a username shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("does not require a password", () => {
    const { name, username, role } = VALID_USER;
    expect(updateUserSchema.safeParse({ name, username, role }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse",
      confirmPassword: "different-horse",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "correct-horse",
      confirmPassword: "correct-horse",
    });
    expect(result.success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  it("requires a current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "correct-horse",
      confirmPassword: "correct-horse",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "correct-horse",
      confirmPassword: "different-horse",
    });
    expect(result.success).toBe(false);
  });
});
