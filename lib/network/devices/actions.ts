"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { DeleteBlockedError } from "@/lib/shared/errors";
import { createDeviceSchema, updateDeviceSchema } from "./schema";
import { deleteDevice } from "./service";

export interface DeviceFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: DeviceFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

const UNIQUE_FIELD_MESSAGES: Record<string, string> = {
  serialNumber: "الرقم التسلسلي مستخدم بالفعل لجهاز آخر.",
  mac: "عنوان MAC مستخدم بالفعل لجهاز آخر.",
  managementIp: "عنوان الإدارة (IP) مستخدم بالفعل لجهاز آخر.",
};

function duplicateFieldError(err: unknown): DeviceFormState | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
    return null;
  }
  const target = (err.meta?.target as string[] | undefined) ?? [];
  const field = target.find((name) => name in UNIQUE_FIELD_MESSAGES);
  if (field) {
    return { errors: { [field]: [UNIQUE_FIELD_MESSAGES[field]] } };
  }
  return { errors: { _form: ["قيمة مستخدمة بالفعل لجهاز آخر."] } };
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createDeviceAction(
  _prevState: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createDeviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const device = await prisma.networkDevice.create({ data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DEVICE_CREATED",
        entityType: "NetworkDevice",
        entityId: device.id,
        summary: `تمت إضافة جهاز جديد: ${device.name}`,
      },
    });
  } catch (err) {
    const duplicateError = duplicateFieldError(err);
    if (duplicateError) return duplicateError;
    return { errors: { _form: ["حدث خطأ أثناء إضافة الجهاز. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/devices");
  return { ok: true };
}

export async function updateDeviceAction(
  deviceId: string,
  _prevState: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updateDeviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const device = await prisma.networkDevice.update({
      where: { id: deviceId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DEVICE_UPDATED",
        entityType: "NetworkDevice",
        entityId: device.id,
        summary: `تم تعديل جهاز: ${device.name}`,
      },
    });
  } catch (err) {
    const duplicateError = duplicateFieldError(err);
    if (duplicateError) return duplicateError;
    return { errors: { _form: ["حدث خطأ أثناء تعديل الجهاز. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/devices");
  revalidatePath(`/network/devices/${deviceId}`);
  return { ok: true };
}

export async function deleteDeviceAction(deviceId: string): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session) {
    return { error: "يجب تسجيل الدخول للقيام بهذا الإجراء." };
  }

  try {
    await deleteDevice(deviceId, session.user.id);
  } catch (err) {
    if (err instanceof DeleteBlockedError) {
      return { error: err.reasons.join(" ") };
    }
    return { error: "حدث خطأ أثناء حذف الجهاز. حاول مرة أخرى." };
  }

  revalidatePath("/network/devices");
  return { ok: true };
}
