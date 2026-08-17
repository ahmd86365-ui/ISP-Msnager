"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { subscriptionPlanSchema } from "./schema";
import {
  ActiveSubscriptionExistsError,
  changeSubscriptionPlan,
  createSubscriptionForCustomer,
} from "./service";

export interface SubscriptionFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: SubscriptionFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

const ACTIVE_SUBSCRIPTION_EXISTS_MESSAGE =
  "هذا المشترك لديه اشتراك فعال بالفعل. لا يمكن إنشاء اشتراك جديد له. استخدم خيار «تغيير/تجديد الباقة» على الاشتراك الحالي بدلاً من ذلك.";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createSubscriptionAction(
  customerId: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = subscriptionPlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createSubscriptionForCustomer({
      customerId,
      planId: parsed.data.planId,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch (err) {
    if (err instanceof ActiveSubscriptionExistsError) {
      return { errors: { _form: [ACTIVE_SUBSCRIPTION_EXISTS_MESSAGE] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إنشاء الاشتراك. حاول مرة أخرى."] } };
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/subscriptions");
  return { ok: true };
}

export async function changeSubscriptionPlanAction(
  customerId: string,
  currentSubscriptionId: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = subscriptionPlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await changeSubscriptionPlan({
      customerId,
      currentSubscriptionId,
      newPlanId: parsed.data.planId,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch (err) {
    if (err instanceof ActiveSubscriptionExistsError) {
      return { errors: { _form: [ACTIVE_SUBSCRIPTION_EXISTS_MESSAGE] } };
    }
    return {
      errors: { _form: ["حدث خطأ أثناء تغيير/تجديد الاشتراك. حاول مرة أخرى."] },
    };
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${currentSubscriptionId}`);
  return { ok: true };
}
