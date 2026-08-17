import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const optionalSelect = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const deviceBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الجهاز يجب أن يتكون من حرفين على الأقل")
    .max(100, "الاسم طويل جداً"),
  hostname: optionalText(100),
  type: z.enum(["ROUTER", "SWITCH", "ACCESS_POINT", "CPE", "OTHER"], {
    message: "نوع جهاز غير صالح",
  }),
  vendor: z.string().trim().min(1, "الشركة المصنّعة مطلوبة").max(100, "قيمة طويلة جداً"),
  model: z.string().trim().min(1, "الموديل مطلوب").max(100, "قيمة طويلة جداً"),
  serialNumber: optionalText(100),
  mac: optionalText(50),
  managementIp: optionalText(50),
  distributionPointId: z.string().trim().min(1, "يجب اختيار نقطة توزيع"),
  buildingId: optionalSelect,
  notes: optionalText(1000),
});

export const createDeviceSchema = deviceBaseSchema;

export const updateDeviceSchema = deviceBaseSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "DISABLED"], {
    message: "حالة غير صالحة",
  }),
});

export type DeviceFormValues = z.infer<typeof deviceBaseSchema>;
