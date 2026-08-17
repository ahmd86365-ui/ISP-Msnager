"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { DeleteBlockedError } from "@/lib/shared/errors";
import { generateCustomerNumber } from "./customer-number";
import { createCustomerSchema, updateCustomerSchema } from "./schema";
import { deleteCustomer } from "./service";

export interface CustomerFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: CustomerFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createCustomerSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const customerNumber = await generateCustomerNumber();
    const customer = await prisma.customer.create({
      data: {
        ...parsed.data,
        customerNumber,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CUSTOMER_CREATED",
        entityType: "Customer",
        entityId: customer.id,
        summary: `تمت إضافة مشترك جديد: ${customer.fullName} (${customer.customerNumber})`,
      },
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء إضافة المشترك. حاول مرة أخرى."] } };
  }

  revalidatePath("/customers");
  return { ok: true };
}

export async function updateCustomerAction(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = updateCustomerSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CUSTOMER_UPDATED",
        entityType: "Customer",
        entityId: customer.id,
        summary: `تم تعديل بيانات المشترك: ${customer.fullName} (${customer.customerNumber})`,
      },
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء تعديل بيانات المشترك. حاول مرة أخرى."] } };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { ok: true };
}

export async function archiveCustomerAction(customerId: string): Promise<void> {
  const session = await auth();
  if (!session) {
    throw new Error("يجب تسجيل الدخول للقيام بهذا الإجراء.");
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: { status: "ARCHIVED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CUSTOMER_ARCHIVED",
      entityType: "Customer",
      entityId: customer.id,
      summary: `تمت أرشفة المشترك: ${customer.fullName} (${customer.customerNumber})`,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function deleteCustomerAction(customerId: string): Promise<DeleteActionResult> {
  const session = await auth();
  if (!session) {
    return { error: "يجب تسجيل الدخول للقيام بهذا الإجراء." };
  }

  try {
    await deleteCustomer(customerId, session.user.id);
  } catch (err) {
    if (err instanceof DeleteBlockedError) {
      return { error: err.reasons.join(" ") };
    }
    return { error: "حدث خطأ أثناء حذف المشترك. حاول مرة أخرى." };
  }

  revalidatePath("/customers");
  return { ok: true };
}
