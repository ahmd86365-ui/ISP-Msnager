import "server-only";

import { prisma } from "@/lib/prisma";

// Feeds the customer-page "assign / move" dialog's cascading Distribution
// Point -> Device -> Switch Port selects with a single query (small ISP
// scale — no pagination needed), mirroring
// lib/payments/queries.ts's listCustomersWithSubscriptionsForPaymentForm.
export async function listNetworkTreeForAssignmentForm() {
  return prisma.distributionPoint.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      devices: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          ports: {
            orderBy: { portNumber: "asc" },
            select: { id: true, portNumber: true, label: true, status: true },
          },
        },
      },
    },
  });
}
