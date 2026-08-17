import "server-only";

import { prisma } from "@/lib/prisma";

// Simple sequential scheme matching the seed data's convention (C-0001...).
// Retries on collision since count-based numbering isn't safe under
// concurrent creates.
export async function generateCustomerNumber(): Promise<string> {
  const count = await prisma.customer.count();
  let attempt = count + 1;

  for (let i = 0; i < 5; i++) {
    const candidate = `C-${String(attempt).padStart(4, "0")}`;
    const exists = await prisma.customer.findUnique({
      where: { customerNumber: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
    attempt++;
  }

  throw new Error("تعذّر توليد رقم مشترك فريد، الرجاء المحاولة مرة أخرى");
}
