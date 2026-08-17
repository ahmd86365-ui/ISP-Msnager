"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { DeleteBlockedError } from "@/lib/shared/errors";
import { createPlanSchema, updatePlanSchema } from "./schema";
import { deletePlan } from "./service";

const DUPLICATE_NAME_MESSAGE = "يوجد بالفعل باقة بنفس هذا الاسم. اختر اسماً مختلفاً.";

function isDuplicateNameError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export interface PlanFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: PlanFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createPlanAction(
  _prevState: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createPlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const plan = await prisma.plan.create({ data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PLAN_CREATED",
        entityType: "Plan",
        entityId: plan.id,
        summary: `تمت إضافة باقة جديدة: ${plan.name}`,
      },
    });
  } catch (err) {
    if (isDuplicateNameError(err)) {
      return { errors: { name: [DUPLICATE_NAME_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إضافة الباقة. حاول مرة أخرى."] } };
  }

  revalidatePath("/plans");
  return { ok: true };
}

export async function updatePlanAction(
  planId: string,
  _prevState: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updatePlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PLAN_UPDATED",
        entityType: "Plan",
        entityId: plan.id,
        summary: `تم تعديل باقة: ${plan.name}`,
      },
    });
  } catch (err) {
    if (isDuplicateNameError(err)) {
      return { errors: { name: [DUPLICATE_NAME_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء تعديل الباقة. حاول مرة أخرى."] } };
  }

  revalidatePath("/plans");
  return { ok: true };
}

export async function togglePlanActiveAction(planId: string): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("يجب تسجيل الدخول للقيام بهذا الإجراء.");
  }

  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } });
  const updated = await prisma.plan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: updated.isActive ? "PLAN_ACTIVATED" : "PLAN_DEACTIVATED",
      entityType: "Plan",
      entityId: updated.id,
      summary: updated.isActive
        ? `تم تفعيل باقة: ${updated.name}`
        : `تم تعطيل باقة: ${updated.name}`,
    },
  });

  revalidatePath("/plans");
}

export async function deletePlanAction(planId: string): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session) {
    return { error: "يجب تسجيل الدخول للقيام بهذا الإجراء." };
  }

  try {
    await deletePlan(planId, session.user.id);
  } catch (err) {
    if (err instanceof DeleteBlockedError) {
      return { error: err.reasons.join(" ") };
    }
    return { error: "حدث خطأ أثناء حذف الباقة. حاول مرة أخرى." };
  }

  revalidatePath("/plans");
  return { ok: true };
}
