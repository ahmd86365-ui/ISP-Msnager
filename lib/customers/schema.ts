import { z } from "zod";

const PHONE_REGEX = /^[0-9+\-\s]{7,20}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const customerBaseSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يتكون من حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  phone: z
    .string()
    .trim()
    .min(1, "رقم الهاتف مطلوب")
    .regex(PHONE_REGEX, "رقم الهاتف غير صالح"),
  phone2: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "رقم الهاتف الثاني غير صالح")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  address: z
    .string()
    .trim()
    .min(3, "العنوان مطلوب")
    .max(200, "العنوان طويل جداً"),
  unitLabel: z
    .string()
    .trim()
    .min(1, "رقم الشقة/الوحدة مطلوب")
    .max(50, "قيمة طويلة جداً"),
  buildingId: z.string().trim().min(1, "يجب اختيار البناء"),
  notes: optionalText(1000),
});

export const createCustomerSchema = customerBaseSchema;

export const updateCustomerSchema = customerBaseSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"], {
    message: "حالة غير صالحة",
  }),
});

export type CustomerFormValues = z.infer<typeof customerBaseSchema>;
