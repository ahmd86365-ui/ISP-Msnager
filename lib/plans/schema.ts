import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const planBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الباقة يجب أن يتكون من حرفين على الأقل")
    .max(100, "اسم الباقة طويل جداً"),
  description: optionalText(500),
  downloadMbps: z.coerce
    .number({ message: "سرعة التحميل مطلوبة" })
    .int("يجب أن تكون قيمة صحيحة")
    .positive("يجب أن تكون قيمة موجبة"),
  uploadMbps: z.coerce
    .number({ message: "سرعة الرفع مطلوبة" })
    .int("يجب أن تكون قيمة صحيحة")
    .positive("يجب أن تكون قيمة موجبة"),
  priceSyp: z.coerce
    .number({ message: "السعر مطلوب" })
    .int("يجب أن يكون السعر عدداً صحيحاً")
    .positive("يجب أن يكون السعر أكبر من صفر"),
  billingPeriod: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"], {
    message: "دورة فوترة غير صالحة",
  }),
});

export const createPlanSchema = planBaseSchema;
export const updatePlanSchema = planBaseSchema;

export type PlanFormValues = z.infer<typeof planBaseSchema>;
