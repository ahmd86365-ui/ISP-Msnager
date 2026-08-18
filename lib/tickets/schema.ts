import { z } from "zod";

const optionalSelect = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const createTicketSchema = z.object({
  customerId: optionalSelect,
  title: z.string().trim().min(1, "العنوان مطلوب").max(200, "الحد الأقصى 200 حرفاً"),
  description: z
    .string()
    .trim()
    .min(1, "الوصف مطلوب")
    .max(5000, "الحد الأقصى 5000 حرف"),
  category: z.enum(
    [
      "INTERNET_DOWN",
      "SLOW_SPEED",
      "SIGNAL",
      "DEVICE",
      "CABLE",
      "BILLING",
      "INSTALLATION",
      "OTHER",
    ],
    { message: "تصنيف غير صالح" },
  ),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], { message: "أولوية غير صالحة" })
    .default("MEDIUM"),
  assignedTechnicianId: optionalSelect,
  notes: optionalText(1000),
});

export type CreateTicketValues = z.infer<typeof createTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"], {
    message: "حالة غير صالحة",
  }),
});

export const assignTicketSchema = z.object({
  assignedTechnicianId: optionalSelect,
});

export const addTicketCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "لا يمكن إضافة تعليق فارغ")
    .max(2000, "الحد الأقصى 2000 حرف"),
});
