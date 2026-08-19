"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/require-admin";
import type { DeleteActionResult } from "@/components/shared/delete-confirm-dialog";
import { ForbiddenError } from "@/lib/shared/errors";
import {
  changePasswordSchema,
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "./schema";
import {
  IncorrectPasswordError,
  UsernameTakenError,
  changeOwnPassword,
  createUser,
  resetUserPassword,
  setUserActive,
  updateUser,
} from "./service";

export interface UserFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const NOT_AUTHORIZED_STATE: UserFormState = {
  errors: { _form: ["غير مصرح لك بالقيام بهذا الإجراء."] },
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireAdminSession();
  if (!session) {
    return NOT_AUTHORIZED_STATE;
  }

  const parsed = createUserSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createUser(parsed.data, { id: session.user.id, role: session.user.role });
  } catch (err) {
    if (err instanceof UsernameTakenError) {
      return { errors: { username: [err.message] } };
    }
    if (err instanceof ForbiddenError) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إضافة المستخدم. حاول مرة أخرى."] } };
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function updateUserAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireAdminSession();
  if (!session) {
    return NOT_AUTHORIZED_STATE;
  }

  const parsed = updateUserSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateUser(
      { targetId: userId, ...parsed.data },
      { id: session.user.id, role: session.user.role },
    );
  } catch (err) {
    if (err instanceof UsernameTakenError) {
      return { errors: { username: [err.message] } };
    }
    if (err instanceof ForbiddenError) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء تعديل بيانات المستخدم. حاول مرة أخرى."] } };
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<DeleteActionResult> {
  const session = await requireAdminSession();
  if (!session) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء." };
  }

  try {
    await setUserActive(
      { targetId: userId, isActive },
      { id: session.user.id, role: session.user.role },
    );
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { error: err.message };
    }
    return { error: "حدث خطأ أثناء تحديث حالة المستخدم. حاول مرة أخرى." };
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function resetPasswordAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireAdminSession();
  if (!session) {
    return NOT_AUTHORIZED_STATE;
  }

  const parsed = resetPasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await resetUserPassword(
      { targetId: userId, newPassword: parsed.data.password },
      { id: session.user.id, role: session.user.role },
    );
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { errors: { _form: [err.message] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى."] } };
  }

  return { ok: true };
}

export async function changeOwnPasswordAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  // Gated the same as the rest of this module even though the operation
  // only ever touches the caller's own account — the whole /settings page
  // is OWNER/ADMIN-only (see lib/auth/require-admin.ts), and this action is
  // only ever reachable from that page.
  const session = await requireAdminSession();
  if (!session) {
    return NOT_AUTHORIZED_STATE;
  }

  const parsed = changePasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await changeOwnPassword({
      userId: session.user.id,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
  } catch (err) {
    if (err instanceof IncorrectPasswordError) {
      return { errors: { currentPassword: [err.message] } };
    }
    return { errors: { _form: ["حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى."] } };
  }

  return { ok: true };
}
