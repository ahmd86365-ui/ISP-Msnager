import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const portBaseSchema = z.object({
  portNumber: z.coerce
    .number({ message: "رقم المنفذ مطلوب" })
    .int("يجب أن يكون رقماً صحيحاً")
    .positive("يجب أن يكون رقماً موجباً"),
  label: optionalText(50),
  notes: optionalText(1000),
});

export const createPortSchema = portBaseSchema;

export const updatePortSchema = portBaseSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "DISABLED"], {
    message: "حالة غير صالحة",
  }),
});

export type PortFormValues = z.infer<typeof portBaseSchema>;
