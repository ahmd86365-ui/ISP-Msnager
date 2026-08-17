"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDistributionPointSchema, updateDistributionPointSchema } from "./schema";

export interface DistributionPointFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: DistributionPointFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

const DUPLICATE_CODE_MESSAGE = "يوجد بالفعل نقطة توزيع بنفس هذا الرمز. اختر رمزاً مختلفاً.";

function isDuplicateCodeError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createDistributionPointAction(
  _prevState: DistributionPointFormState,
  formData: FormData,
): Promise<DistributionPointFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createDistributionPointSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const point = await prisma.distributionPoint.create({ data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DISTRIBUTION_POINT_CREATED",
        entityType: "DistributionPoint",
        entityId: point.id,
        summary: `تمت إضافة نقطة توزيع جديدة: ${point.name} (${point.code})`,
      },
    });
  } catch (err) {
    if (isDuplicateCodeError(err)) {
      return { errors: { code: [DUPLICATE_CODE_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إضافة نقطة التوزيع. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/distribution-points");
  return { ok: true };
}

export async function updateDistributionPointAction(
  pointId: string,
  _prevState: DistributionPointFormState,
  formData: FormData,
): Promise<DistributionPointFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updateDistributionPointSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const point = await prisma.distributionPoint.update({
      where: { id: pointId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DISTRIBUTION_POINT_UPDATED",
        entityType: "DistributionPoint",
        entityId: point.id,
        summary: `تم تعديل نقطة توزيع: ${point.name} (${point.code})`,
      },
    });
  } catch (err) {
    if (isDuplicateCodeError(err)) {
      return { errors: { code: [DUPLICATE_CODE_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء تعديل نقطة التوزيع. حاول مرة أخرى."] } };
  }

  revalidatePath("/network/distribution-points");
  return { ok: true };
}
