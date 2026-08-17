import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [scheme, salt, hashHex] = storedHash.split(":");
  if (scheme !== "scrypt" || !salt || !hashHex) {
    return false;
  }

  const storedKey = Buffer.from(hashHex, "hex");
  const derivedKey = scryptSync(password, salt, storedKey.length);

  return (
    derivedKey.length === storedKey.length &&
    timingSafeEqual(derivedKey, storedKey)
  );
}
