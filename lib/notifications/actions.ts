"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface NotificationActionResult {
  ok: boolean;
  error?: string;
}

const UNAUTHENTICATED: NotificationActionResult = {
  ok: false,
  error: "يجب تسجيل الدخول للقيام بهذا الإجراء.",
};

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED;
  }

  // Ownership check — never trust that a client-supplied notification id
  // belongs to the caller. A no-op (not an error) if it's already read.
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: session.user.id },
    data: { isRead: true },
  });

  if (result.count === 0) {
    return { ok: false, error: "الإشعار غير موجود." };
  }

  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED;
  }

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  return { ok: true };
}
