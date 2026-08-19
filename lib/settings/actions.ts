"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { appSettingsSchema } from "./schema";

export interface SettingsFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function updateAppSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await requireAdminSession();
  if (!session) {
    return { errors: { _form: ["غير مصرح لك بالقيام بهذا الإجراء."] } };
  }

  const parsed = appSettingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SETTINGS_UPDATED",
        entityType: "AppSettings",
        entityId: "singleton",
        summary: "تم تحديث إعدادات المنشأة العامة",
      },
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء حفظ الإعدادات. حاول مرة أخرى."] } };
  }

  revalidatePath("/settings");
  return { ok: true };
}
