import type { Role } from "@prisma/client";

// The only role tier this app currently distinguishes for authorization
// purposes (as opposed to display) — mirrors the admin recipient set
// notifyActiveAdmins already uses in lib/notifications/service.ts.
export const ADMIN_ROLES: Role[] = ["OWNER", "ADMIN"];

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}
