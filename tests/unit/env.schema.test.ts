import { describe, expect, it } from "vitest";

import { envSchema } from "@/lib/env.schema";

const VALID_AUTH_SECRET = "a".repeat(32);

describe("envSchema", () => {
  it("accepts a valid configuration", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: VALID_AUTH_SECRET,
    });

    expect(result.success).toBe(true);
  });

  it("defaults NODE_ENV to development when omitted", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: VALID_AUTH_SECRET,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
    }
  });

  it("rejects a missing DATABASE_URL", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
      AUTH_SECRET: VALID_AUTH_SECRET,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a DATABASE_URL that is not a valid URL", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
      DATABASE_URL: "not-a-url",
      AUTH_SECRET: VALID_AUTH_SECRET,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown NODE_ENV value", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "staging",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: VALID_AUTH_SECRET,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing AUTH_SECRET", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an AUTH_SECRET shorter than 32 characters", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: "too-short",
    });

    expect(result.success).toBe(false);
  });
});
