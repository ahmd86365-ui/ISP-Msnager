"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { assignNetworkSchema } from "./schema";
import {
  ConcurrentAssignmentChangeError,
  InvalidDeviceForDistributionPointError,
  InvalidPortForDeviceError,
  assignCustomerToNetwork,
} from "./service";

export interface AssignNetworkFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_STATE: AssignNetworkFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function assignNetworkAction(
  customerId: string,
  _prevState: AssignNetworkFormState,
  formData: FormData,
): Promise<AssignNetworkFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_STATE;
  }

  const parsed = assignNetworkSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await assignCustomerToNetwork({
      customerId,
      distributionPointId: parsed.data.distributionPointId,
      deviceId: parsed.data.deviceId,
      switchPortId: parsed.data.switchPortId,
      ipAddress: parsed.data.ipAddress,
      macAddress: parsed.data.macAddress,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch (err) {
    if (err instanceof InvalidDeviceForDistributionPointError) {
      return { errors: { deviceId: ["الجهاز المختار لا يتبع نقطة التوزيع المختارة."] } };
    }
    if (err instanceof InvalidPortForDeviceError) {
      return { errors: { switchPortId: ["المنفذ المختار لا يتبع الجهاز المختار."] } };
    }
    if (err instanceof ConcurrentAssignmentChangeError) {
      return { errors: { _form: ["حدث تعارض أثناء الحفظ، حاول مرة أخرى."] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء ربط المشترك بالشبكة. حاول مرة أخرى."] } };
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/network/devices");
  return { ok: true };
}
