import { z } from "zod";

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export const nameSchema = z
  .string()
  .trim()
  .min(2, "الاسم يجب أن يتكون من حرفين على الأقل")
  .max(100, "الاسم طويل جداً");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل")
  .max(50, "اسم المستخدم طويل جداً")
  .regex(USERNAME_REGEX, "اسم المستخدم يجب أن يحتوي أحرفاً إنجليزية وأرقاماً فقط");

export const roleSchema = z.enum(["OWNER", "ADMIN", "ACCOUNTANT", "SUPPORT", "TECHNICIAN"], {
  message: "دور غير صالح",
});

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل")
  .max(100, "كلمة المرور طويلة جداً");

export const createUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  role: roleSchema,
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  role: roleSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
