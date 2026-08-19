import "server-only";

import { prisma } from "@/lib/prisma";

export async function getAppSettings() {
  return prisma.appSettings.findUnique({ where: { id: "singleton" } });
}
