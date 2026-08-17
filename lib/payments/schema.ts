import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const createPaymentSchema = z.object({
  customerId: z.string().trim().min(1, "يجب اختيار مشترك"),
  subscriptionId: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  amountSyp: z.coerce
    .number({ message: "المبلغ مطلوب" })
    .int("يجب أن يكون المبلغ عدداً صحيحاً")
    .positive("يجب أن يكون المبلغ أكبر من صفر"),
  method: z.enum(["CASH", "TRANSFER", "WALLET", "OTHER"], {
    message: "طريقة دفع غير صالحة",
  }),
  paidAt: z.coerce.date({ message: "تاريخ الدفع غير صالح" }),
  reference: optionalText(100),
  notes: optionalText(1000),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;

export const voidPaymentSchema = z.object({
  voidReason: optionalText(500),
});
