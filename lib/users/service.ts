import "server-only";

import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ROLE_LABELS } from "@/lib/labels";
import { ForbiddenError } from "@/lib/shared/errors";
import { canAssignRole, canManageTargetUser, checkCanDeactivate } from "./guard";

export interface ActingUser {
  id: string;
  role: Role;
}

export class UsernameTakenError extends Error {
  constructor() {
    super("اسم المستخدم مستخدم بالفعل.");
    this.name = "UsernameTakenError";
  }
}

async function assertUsernameAvailable(username: string, excludeUserId?: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== excludeUserId) {
    throw new UsernameTakenError();
  }
}

export async function createUser(
  params: { name: string; username: string; role: Role; password: string },
  actor: ActingUser,
) {
  if (!canAssignRole(actor.role, params.role)) {
    throw new ForbiddenError("فقط المالك يمكنه منح صلاحية المالك.");
  }
  await assertUsernameAvailable(params.username);

  const user = await prisma.user.create({
    data: {
      name: params.name,
      username: params.username,
      role: params.role,
      passwordHash: hashPassword(params.password),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      summary: `تمت إضافة مستخدم جديد: ${user.name} (${user.username}) — ${ROLE_LABELS[user.role]}`,
    },
  });

  return user;
}

export async function updateUser(
  params: { targetId: string; name: string; username: string; role: Role },
  actor: ActingUser,
) {
  const target = await prisma.user.findUniqueOrThrow({ where: { id: params.targetId } });

  if (!canManageTargetUser(actor.role, target.role)) {
    throw new ForbiddenError("فقط المالك يمكنه إدارة حسابات المالكين.");
  }
  if (target.role !== params.role && !canAssignRole(actor.role, params.role)) {
    throw new ForbiddenError("فقط المالك يمكنه منح صلاحية المالك.");
  }
  await assertUsernameAvailable(params.username, target.id);

  const user = await prisma.user.update({
    where: { id: target.id },
    data: { name: params.name, username: params.username, role: params.role },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: user.id,
      summary: `تم تعديل بيانات المستخدم: ${user.name} (${user.username})`,
    },
  });

  return user;
}

export async function setUserActive(
  params: { targetId: string; isActive: boolean },
  actor: ActingUser,
) {
  const target = await prisma.user.findUniqueOrThrow({ where: { id: params.targetId } });

  if (!canManageTargetUser(actor.role, target.role)) {
    throw new ForbiddenError("فقط المالك يمكنه إدارة حسابات المالكين.");
  }

  if (!params.isActive) {
    const activeOwnerCount = await prisma.user.count({
      where: { role: "OWNER", isActive: true },
    });
    const check = checkCanDeactivate({
      actorId: actor.id,
      targetId: target.id,
      targetRole: target.role,
      activeOwnerCount,
    });
    if (!check.ok) {
      throw new ForbiddenError(check.reason);
    }
  }

  const user = await prisma.user.update({
    where: { id: target.id },
    data: { isActive: params.isActive },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: params.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entityType: "User",
      entityId: user.id,
      summary: params.isActive
        ? `تم تفعيل حساب المستخدم: ${user.name} (${user.username})`
        : `تم إلغاء تفعيل حساب المستخدم: ${user.name} (${user.username})`,
    },
  });

  return user;
}

export async function resetUserPassword(
  params: { targetId: string; newPassword: string },
  actor: ActingUser,
) {
  const target = await prisma.user.findUniqueOrThrow({ where: { id: params.targetId } });

  if (!canManageTargetUser(actor.role, target.role)) {
    throw new ForbiddenError("فقط المالك يمكنه إدارة حسابات المالكين.");
  }

  const user = await prisma.user.update({
    where: { id: target.id },
    data: { passwordHash: hashPassword(params.newPassword) },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "USER_PASSWORD_RESET",
      entityType: "User",
      entityId: user.id,
      summary: `تم إعادة تعيين كلمة مرور المستخدم: ${user.name} (${user.username})`,
    },
  });
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super("كلمة المرور الحالية غير صحيحة.");
    this.name = "IncorrectPasswordError";
  }
}

export async function changeOwnPassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: params.userId } });

  if (!verifyPassword(params.currentPassword, user.passwordHash)) {
    throw new IncorrectPasswordError();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(params.newPassword) },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_PASSWORD_CHANGED_SELF",
      entityType: "User",
      entityId: user.id,
      summary: `قام ${user.name} (${user.username}) بتغيير كلمة المرور الخاصة به`,
    },
  });
}
