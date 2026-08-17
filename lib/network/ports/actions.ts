"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { DeleteBlockedError } from "@/lib/shared/errors";
import { createPortSchema, updatePortSchema } from "./schema";
import { deletePort } from "./service";

export interface PortFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: PortFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

const DUPLICATE_PORT_MESSAGE = "يوجد بالفعل منفذ بهذا الرقم على هذا الجهاز.";

function isDuplicatePortError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createPortAction(
  deviceId: string,
  _prevState: PortFormState,
  formData: FormData,
): Promise<PortFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createPortSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const port = await prisma.switchPort.create({
      data: { ...parsed.data, deviceId },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PORT_CREATED",
        entityType: "SwitchPort",
        entityId: port.id,
        summary: `تمت إضافة منفذ رقم ${port.portNumber}`,
      },
    });
  } catch (err) {
    if (isDuplicatePortError(err)) {
      return { errors: { portNumber: [DUPLICATE_PORT_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إضافة المنفذ. حاول مرة أخرى."] } };
  }

  revalidatePath(`/network/devices/${deviceId}`);
  return { ok: true };
}

export async function deletePortAction(
  deviceId: string,
  portId: string,
): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session) {
    return { error: "يجب تسجيل الدخول للقيام بهذا الإجراء." };
  }

  try {
    await deletePort(portId, deviceId, session.user.id);
  } catch (err) {
    if (err instanceof DeleteBlockedError) {
      return { error: err.reasons.join(" ") };
    }
    return { error: "حدث خطأ أثناء حذف المنفذ. حاول مرة أخرى." };
  }

  revalidatePath(`/network/devices/${deviceId}`);
  return { ok: true };
}

export async function updatePortAction(
  deviceId: string,
  portId: string,
  _prevState: PortFormState,
  formData: FormData,
): Promise<PortFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updatePortSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const port = await prisma.switchPort.update({
      where: { id: portId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PORT_UPDATED",
        entityType: "SwitchPort",
        entityId: port.id,
        summary: `تم تعديل منفذ رقم ${port.portNumber}`,
      },
    });
  } catch (err) {
    if (isDuplicatePortError(err)) {
      return { errors: { portNumber: [DUPLICATE_PORT_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء تعديل المنفذ. حاول مرة أخرى."] } };
  }

  revalidatePath(`/network/devices/${deviceId}`);
  return { ok: true };
}
