"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createPaymentSchema, voidPaymentSchema } from "./schema";
import {
  InvalidSubscriptionForCustomerError,
  PaymentAlreadyVoidedError,
  createPayment,
  voidPayment,
} from "./service";

export interface PaymentFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: PaymentFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createPaymentAction(
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createPaymentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createPayment({
      customerId: parsed.data.customerId,
      subscriptionId: parsed.data.subscriptionId,
      amountSyp: parsed.data.amountSyp,
      method: parsed.data.method,
      paidAt: parsed.data.paidAt,
      reference: parsed.data.reference,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch (err) {
    if (err instanceof InvalidSubscriptionForCustomerError) {
      return {
        errors: { _form: ["الاشتراك المختار لا يخص هذا المشترك. أعد المحاولة."] },
      };
    }
    return { errors: { _form: ["حدث خطأ أثناء تسجيل الدفعة. حاول مرة أخرى."] } };
  }

  revalidatePath("/payments");
  revalidatePath(`/customers/${parsed.data.customerId}`);
  return { ok: true };
}

// Bound to a fixed customer from the customer detail page — reuses the same
// schema/service but the customerId comes from the caller, not the form, so
// it cannot be tampered with via the submitted FormData.
export async function createCustomerPaymentAction(
  customerId: string,
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = createPaymentSchema
    .omit({ customerId: true })
    .safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createPayment({
      customerId,
      subscriptionId: parsed.data.subscriptionId,
      amountSyp: parsed.data.amountSyp,
      method: parsed.data.method,
      paidAt: parsed.data.paidAt,
      reference: parsed.data.reference,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch (err) {
    if (err instanceof InvalidSubscriptionForCustomerError) {
      return {
        errors: { _form: ["الاشتراك المختار لا يخص هذا المشترك. أعد المحاولة."] },
      };
    }
    return { errors: { _form: ["حدث خطأ أثناء تسجيل الدفعة. حاول مرة أخرى."] } };
  }

  revalidatePath("/payments");
  revalidatePath(`/customers/${customerId}`);
  return { ok: true };
}

export async function voidPaymentAction(
  paymentId: string,
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = voidPaymentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const payment = await voidPayment({
      paymentId,
      voidReason: parsed.data.voidReason,
      actorId: session.user.id,
    });
    revalidatePath("/payments");
    revalidatePath(`/customers/${payment.customerId}`);
  } catch (err) {
    if (err instanceof PaymentAlreadyVoidedError) {
      return { errors: { _form: ["هذه الدفعة ملغاة بالفعل."] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إلغاء الدفعة. حاول مرة أخرى."] } };
  }

  return { ok: true };
}
