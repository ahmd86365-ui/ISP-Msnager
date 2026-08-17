// Pure balance/debt math, kept separate from service.ts's Prisma calls so it
// is directly unit-testable without a live database (this project's test
// environment has no DB — see tests/unit/payments-balance.test.ts).

export interface PaymentForBalance {
  amountSyp: number;
  isVoided: boolean;
}

export interface SubscriptionForBalance {
  priceAtSubscriptionSyp: number;
  startDate: Date;
}

// Voided payments never count toward what the customer has paid.
export function sumNonVoidedPayments(payments: PaymentForBalance[]): number {
  return payments
    .filter((payment) => !payment.isVoided)
    .reduce((sum, payment) => sum + payment.amountSyp, 0);
}

// A subscription's price counts as "due" once its billing period has
// started — not before (a PENDING/future subscription isn't owed yet), and
// regardless of what happens to it afterwards (there is no proration/FIFO
// allocation system yet, see lib/payments/service.ts's getCustomerBalance).
export function sumDueSubscriptions(
  subscriptions: SubscriptionForBalance[],
  now: Date = new Date(),
): number {
  return subscriptions
    .filter((subscription) => subscription.startDate <= now)
    .reduce((sum, subscription) => sum + subscription.priceAtSubscriptionSyp, 0);
}

// Outstanding debt is never negative — an overpayment isn't surfaced as a
// separate credit figure in this step.
export function computeDebtSyp(totalDueSyp: number, totalPaidSyp: number): number {
  return Math.max(0, totalDueSyp - totalPaidSyp);
}
