import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

// Coercing an empty string straight to z.coerce.number() would produce 0
// (JS: Number("") === 0), not "missing" — so the empty-string case is
// resolved to undefined *before* any numeric conversion happens, same
// string-first pattern as optionalText above.
const optionalCoordinate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? Number(value) : undefined))
  .refine((value) => value === undefined || !Number.isNaN(value), {
    message: "قيمة غير صالحة",
  });

export const distributionPointBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم نقطة التوزيع يجب أن يتكون من حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  code: z
    .string()
    .trim()
    .min(1, "رمز نقطة التوزيع مطلوب")
    .max(30, "الرمز طويل جداً"),
  area: z.string().trim().min(1, "المنطقة مطلوبة").max(100, "قيمة طويلة جداً"),
  description: optionalText(500),
  lat: optionalCoordinate,
  lng: optionalCoordinate,
  notes: optionalText(1000),
});

export const createDistributionPointSchema = distributionPointBaseSchema;

export const updateDistributionPointSchema = distributionPointBaseSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "DISABLED"], {
    message: "حالة غير صالحة",
  }),
});

export type DistributionPointFormValues = z.infer<typeof distributionPointBaseSchema>;
