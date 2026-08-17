import "server-only";

import { Prisma, type SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { computeSubscriptionEndDate } from "./billing";

// Thrown whenever an ACTIVE subscription would be created for a customer who
// already has one. The one-ACTIVE-per-customer rule is enforced twice: here
// (for a clear, immediate error message) and by the database's partial
// unique index (see prisma/schema.prisma, Subscription model) as the final
// guard against a race between two concurrent requests.
export class ActiveSubscriptionExistsError extends Error {
  activeSubscriptionId?: string;

  constructor(activeSubscriptionId?: string) {
    super("Customer already has an active subscription");
    this.name = "ActiveSubscriptionExistsError";
    this.activeSubscriptionId = activeSubscriptionId;
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

export async function createSubscriptionForCustomer(params: {
  customerId: string;
  planId: string;
  notes?: string;
  actorId: string;
}) {
  const plan = await prisma.plan.findUniqueOrThrow({
    where: { id: params.planId },
  });

  const existingActive = await prisma.subscription.findFirst({
    where: { customerId: params.customerId, status: "ACTIVE" },
    select: { id: true },
  });
  if (existingActive) {
    throw new ActiveSubscriptionExistsError(existingActive.id);
  }

  const startDate = new Date();
  const endDate = computeSubscriptionEndDate(startDate, plan.billingPeriod);

  try {
    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          customerId: params.customerId,
          planId: plan.id,
          startDate,
          endDate,
          status: "ACTIVE",
          priceAtSubscriptionSyp: plan.priceSyp,
          notes: params.notes,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: params.actorId,
          action: "SUBSCRIPTION_CREATED",
          entityType: "Subscription",
          entityId: subscription.id,
          summary: `تم إنشاء اشتراك جديد بباقة "${plan.name}"`,
        },
      });

      return subscription;
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ActiveSubscriptionExistsError();
    }
    throw err;
  }
}

// Renews or switches a customer's plan without mutating the historical
// subscription row: the current ACTIVE subscription is transitioned to a
// terminal status and a brand new subscription is created with the target
// plan's current price. Both operations run in one transaction so the
// customer is never left without (or with two) ACTIVE subscriptions.
//
// The superseded subscription becomes EXPIRED if its period had already run
// out, or CANCELLED if it still had time left (an early plan change/upgrade)
// — this distinction isn't specified verbatim in the docs, but follows the
// natural meaning of the two statuses already defined on Subscription.
export async function changeSubscriptionPlan(params: {
  customerId: string;
  currentSubscriptionId: string;
  newPlanId: string;
  notes?: string;
  actorId: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.subscription.findUnique({
        where: { id: params.currentSubscriptionId },
      });
      if (
        !current ||
        current.customerId !== params.customerId ||
        current.status !== "ACTIVE"
      ) {
        throw new Error("الاشتراك الحالي غير صالح لهذه العملية");
      }

      const plan = await tx.plan.findUniqueOrThrow({
        where: { id: params.newPlanId },
      });

      const now = new Date();
      const supersededStatus: SubscriptionStatus =
        current.endDate <= now ? "EXPIRED" : "CANCELLED";

      await tx.subscription.update({
        where: { id: current.id },
        data: { status: supersededStatus },
      });

      const startDate = now;
      const endDate = computeSubscriptionEndDate(startDate, plan.billingPeriod);

      const next = await tx.subscription.create({
        data: {
          customerId: params.customerId,
          planId: plan.id,
          startDate,
          endDate,
          status: "ACTIVE",
          priceAtSubscriptionSyp: plan.priceSyp,
          notes: params.notes,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: params.actorId,
          action: "SUBSCRIPTION_RENEWED",
          entityType: "Subscription",
          entityId: next.id,
          summary: `تم تجديد/تغيير باقة الاشتراك إلى "${plan.name}"`,
        },
      });

      return next;
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ActiveSubscriptionExistsError();
    }
    throw err;
  }
}
