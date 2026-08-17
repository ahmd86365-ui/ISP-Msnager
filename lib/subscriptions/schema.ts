import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفاً`)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

// Shared by "create subscription" and "change/renew plan" — both only ever
// take a target plan; price/dates/status are always server-computed, never
// user input (see lib/subscriptions/service.ts).
export const subscriptionPlanSchema = z.object({
  planId: z.string().trim().min(1, "يجب اختيار باقة"),
  notes: optionalText(1000),
});

export type SubscriptionPlanFormValues = z.infer<typeof subscriptionPlanSchema>;
