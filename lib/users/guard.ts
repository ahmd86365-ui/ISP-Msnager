// Pure "is this user-management action allowed" logic, kept separate from
// service.ts so it's directly unit-testable without a live database (this
// project's test environment has no DB — see tests/unit/users-guard.test.ts
// and lib/shared/delete-guard.ts for the established pattern).

import type { Role } from "@prisma/client";

// An ADMIN may manage any account except an OWNER's — only an OWNER may
// edit, deactivate, or reset the password of another OWNER account. This
// prevents a compromised or malicious ADMIN account from taking over the
// business owner's account.
export function canManageTargetUser(actorRole: Role, targetRole: Role): boolean {
  return targetRole !== "OWNER" || actorRole === "OWNER";
}

// Only an OWNER may grant or remove the OWNER role.
export function canAssignRole(actorRole: Role, role: Role): boolean {
  return role !== "OWNER" || actorRole === "OWNER";
}

export interface DeactivationCheckParams {
  actorId: string;
  targetId: string;
  targetRole: Role;
  activeOwnerCount: number;
}

// Only relevant for the true -> false transition; reactivating is always
// safe once canManageTargetUser has already passed.
export function checkCanDeactivate(
  params: DeactivationCheckParams,
): { ok: true } | { ok: false; reason: string } {
  if (params.actorId === params.targetId) {
    return { ok: false, reason: "لا يمكنك إلغاء تفعيل حسابك الخاص." };
  }
  if (params.targetRole === "OWNER" && params.activeOwnerCount <= 1) {
    return { ok: false, reason: "لا يمكن إلغاء تفعيل آخر حساب مالك نشط." };
  }
  return { ok: true };
}
