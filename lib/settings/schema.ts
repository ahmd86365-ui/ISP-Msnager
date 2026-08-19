import { z } from "zod";

export const appSettingsSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "اسم المنشأة يجب أن يتكون من حرفين على الأقل")
    .max(150, "اسم المنشأة طويل جداً"),
  currency: z
    .string()
    .trim()
    .min(1, "رمز العملة مطلوب")
    .max(10, "رمز العملة طويل جداً"),
  timezone: z
    .string()
    .trim()
    .min(1, "المنطقة الزمنية مطلوبة")
    .max(50, "قيمة طويلة جداً"),
});

export type AppSettingsValues = z.infer<typeof appSettingsSchema>;
