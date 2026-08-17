"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { DeleteBlockedError } from "@/lib/shared/errors";
import { createBuildingSchema, updateBuildingSchema } from "./schema";
import { deleteBuilding } from "./service";

export interface BuildingFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: BuildingFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createBuildingAction(
  _prevState: BuildingFormState,
  formData: FormData,
): Promise<BuildingFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createBuildingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const building = await prisma.building.create({ data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BUILDING_CREATED",
        entityType: "Building",
        entityId: building.id,
        summary: `تمت إضافة بناء جديد: ${building.name}`,
      },
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء إضافة البناء. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/buildings");
  return { ok: true };
}

export async function deleteBuildingAction(buildingId: string): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session) {
    return { error: "يجب تسجيل الدخول للقيام بهذا الإجراء." };
  }

  try {
    await deleteBuilding(buildingId, session.user.id);
  } catch (err) {
    if (err instanceof DeleteBlockedError) {
      return { error: err.reasons.join(" ") };
    }
    return { error: "حدث خطأ أثناء حذف البناء. حاول مرة أخرى." };
  }

  revalidatePath("/network/buildings");
  return { ok: true };
}

export async function updateBuildingAction(
  buildingId: string,
  _prevState: BuildingFormState,
  formData: FormData,
): Promise<BuildingFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updateBuildingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const building = await prisma.building.update({
      where: { id: buildingId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BUILDING_UPDATED",
        entityType: "Building",
        entityId: building.id,
        summary: `تم تعديل بناء: ${building.name}`,
      },
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء تعديل البناء. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/buildings");
  return { ok: true };
}
