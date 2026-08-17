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

// All fields are optional at the DB level too (see NetworkAssignment in
// prisma/schema.prisma) — a staff member can record a bare IP/MAC without
// having picked a formal distribution point/device/port yet.
export const assignNetworkSchema = z.object({
  distributionPointId: optionalSelect,
  deviceId: optionalSelect,
  switchPortId: optionalSelect,
  ipAddress: optionalText(45),
  macAddress: optionalText(50),
  notes: optionalText(1000),
});

export type AssignNetworkValues = z.infer<typeof assignNetworkSchema>;
