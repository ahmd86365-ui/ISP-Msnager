import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyActiveAdmins } from "@/lib/notifications/service";
import { computeDebtSyp, sumDueSubscriptions, sumNonVoidedPayments } from "./balance";

export class InvalidSubscriptionForCustomerError extends Error {
  constructor() {
    super("Subscription does not belong to this customer");
    this.name = "InvalidSubscriptionForCustomerError";
  }
}

export class PaymentAlreadyVoidedError extends Error {
  constructor() {
    super("Payment is already voided");
    this.name = "PaymentAlreadyVoidedError";
  }
}

export async function createPayment(params: {
  customerId: string;
  subscriptionId?: string;
  amountSyp: number;
  method: "CASH" | "TRANSFER" | "WALLET" | "OTHER";
  paidAt: Date;
  reference?: string;
  notes?: string;
  actorId: string;
}) {
  // Never trust a client-supplied subscriptionId at face value: confirm it
  // actually belongs to the given customer before attaching it, otherwise a
  // tampered form post could record a payment against another customer's
  // subscription.
  if (params.subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.subscriptionId },
      select: { customerId: true },
    });
    if (!subscription || subscription.customerId !== params.customerId) {
      throw new InvalidSubscriptionForCustomerError();
    }
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        customerId: params.customerId,
        subscriptionId: params.subscriptionId,
        amountSyp: params.amountSyp,
        method: params.method,
        paidAt: params.paidAt,
        reference: params.reference,
        notes: params.notes,
        createdById: params.actorId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: "PAYMENT_CREATED",
        entityType: "Payment",
        entityId: payment.id,
        summary: `تم تسجيل دفعة بقيمة ${payment.amountSyp} ل.س`,
      },
    });

    return payment;
  });
}

export async function voidPayment(params: {
  paymentId: string;
  voidReason?: string;
  actorId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUniqueOrThrow({
      where: { id: params.paymentId },
    });
    if (existing.isVoided) {
      throw new PaymentAlreadyVoidedError();
    }

    const payment = await tx.payment.update({
      where: { id: params.paymentId },
      data: {
        isVoided: true,
        voidedAt: new Date(),
        voidedById: params.actorId,
        voidReason: params.voidReason,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: params.actorId,
        action: "PAYMENT_VOIDED",
        entityType: "Payment",
        entityId: payment.id,
        summary: `تم إلغاء دفعة بقيمة ${payment.amountSyp} ل.س`,
      },
    });

    // No Payment detail page exists — points at the customer's profile,
    // where the voided payment is visible in their payment history.
    const customer = await tx.customer.findUniqueOrThrow({
      where: { id: payment.customerId },
      select: { fullName: true },
    });
    await notifyActiveAdmins(
      {
        type: "PAYMENT_VOIDED",
        title: "تم إلغاء دفعة",
        body: `${payment.amountSyp} ل.س — ${customer.fullName}`,
        relatedEntityType: "Customer",
        relatedEntityId: payment.customerId,
      },
      tx,
    );

    return payment;
  });
}

// Balance calculation — documented assumption (no Payment Allocation/Ledger
// table exists yet, per the current step's constraints). The actual math
// lives in lib/payments/balance.ts (pure, unit-tested); this function is
// just the Prisma data-fetching wrapper around it:
//
//   totalDue  = sum of priceAtSubscriptionSyp for the customer's
//               subscriptions that have already started (startDate <= now),
//               across ALL statuses. Once a billing period starts the
//               customer owes that period's price; a later renewal/
//               cancellation does not retroactively erase what was already
//               owed (there is no proration/FIFO allocation system yet).
//   totalPaid = sum of amountSyp for the customer's non-voided payments.
//   debtSyp   = max(0, totalDue - totalPaid) — never negative; an
//               overpayment is not surfaced as a separate "credit" figure
//               in this step.
//
// This is a straightforward running-total model, not a precise per-period
// FIFO allocation (matching lib/dashboard/queries.ts's existing aggregate
// note that FIFO allocation is a future Payments feature).
export async function getCustomerBalance(customerId: string) {
  const [subscriptions, payments] = await Promise.all([
    prisma.subscription.findMany({
      where: { customerId },
      select: { priceAtSubscriptionSyp: true, startDate: true },
    }),
    prisma.payment.findMany({
      where: { customerId },
      select: { amountSyp: true, isVoided: true },
    }),
  ]);

  const totalDueSyp = sumDueSubscriptions(subscriptions);
  const totalPaidSyp = sumNonVoidedPayments(payments);
  const debtSyp = computeDebtSyp(totalDueSyp, totalPaidSyp);

  return { totalDueSyp, totalPaidSyp, debtSyp };
}
