import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { classifySubscriptionExpiry, EXPIRING_SOON_WINDOW_DAYS } from "./expiry";

// Any of these calls may run inside an existing $transaction (ticket/payment
// service functions already wrap their work in one) or standalone (the
// subscription-expiry reconciliation below) — accept either client.
type DbClient = Prisma.TransactionClient | typeof prisma;

export interface CreateNotificationParams {
  recipientId: string;
  type: string;
  title: string;
  body: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Plain, unconditional create — for genuinely one-time server-side events
// (ticket assigned, critical ticket created, payment voided). These fire
// exactly once at the moment the event happens, so there is nothing to
// de-duplicate against.
export async function createNotification(
  params: CreateNotificationParams,
  client: DbClient = prisma,
) {
  return client.notification.create({ data: params });
}

export interface DedupedNotificationParams extends CreateNotificationParams {
  relatedEntityType: string;
  relatedEntityId: string;
}

// For notifications a repeating scan might otherwise generate more than
// once (the subscription-expiry reconciliation runs on a schedule, not on a
// single event) — skips creating a row if one already exists for this exact
// recipient+type+related entity.
export async function notifyIfNotExists(
  params: DedupedNotificationParams,
  client: DbClient = prisma,
) {
  const existing = await client.notification.findFirst({
    where: {
      recipientId: params.recipientId,
      type: params.type,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    },
    select: { id: true },
  });
  if (existing) {
    return null;
  }
  return client.notification.create({ data: params });
}

async function getActiveAdminUserIds(client: DbClient = prisma): Promise<string[]> {
  const users = await client.user.findMany({
    where: { isActive: true, role: { in: ["OWNER", "ADMIN"] } },
    select: { id: true },
  });
  return users.map((user) => user.id);
}

// Fan-out to every active OWNER/ADMIN — the small, fixed audience for the
// admin-facing notification rules (critical ticket, voided payment,
// subscription expiry). Bounded by this app's realistic staff count.
export async function notifyActiveAdmins(
  params: Omit<CreateNotificationParams, "recipientId">,
  client: DbClient = prisma,
) {
  const adminIds = await getActiveAdminUserIds(client);
  await Promise.all(
    adminIds.map((recipientId) => createNotification({ ...params, recipientId }, client)),
  );
}

const RECONCILIATION_SETTINGS_KEY = "lastSubscriptionReconciliationDate";

function todayDateString(now: Date): string {
  return now.toLocaleDateString("en-CA");
}

async function reconcileSubscriptionExpiryNotifications(now: Date): Promise<void> {
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + EXPIRING_SOON_WINDOW_DAYS);

  const subscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE", endDate: { lte: windowEnd } },
    select: {
      id: true,
      endDate: true,
      customer: { select: { fullName: true } },
      plan: { select: { name: true } },
    },
  });
  if (subscriptions.length === 0) {
    return;
  }

  const adminIds = await getActiveAdminUserIds();
  if (adminIds.length === 0) {
    return;
  }

  for (const subscription of subscriptions) {
    const state = classifySubscriptionExpiry(subscription.endDate, now);
    if (state === "NONE") {
      continue;
    }

    const type = state === "EXPIRED" ? "SUBSCRIPTION_EXPIRED" : "SUBSCRIPTION_EXPIRING_SOON";
    const title = state === "EXPIRED" ? "اشتراك منتهٍ" : "اشتراك على وشك الانتهاء";
    const body = `${subscription.customer.fullName} — ${subscription.plan.name} (${subscription.endDate.toLocaleDateString("en-CA")})`;

    for (const recipientId of adminIds) {
      await notifyIfNotExists({
        recipientId,
        type,
        title,
        body,
        relatedEntityType: "Subscription",
        relatedEntityId: subscription.id,
      });
    }
  }
}

// Throttled to at most once per calendar day via a marker stored in
// AppSettings.settings (no schema change — that column is already free-form
// JSON and otherwise unused). Idempotent regardless of the throttle thanks
// to notifyIfNotExists, and defensively swallows its own errors so a
// notification-reconciliation failure never breaks the dashboard layout
// that calls it on every authenticated request.
//
// This is an interim MVP substitute for a real scheduled job — see the
// approved Notifications plan. No cron/queue infrastructure is introduced
// here; once a deployment platform is chosen this can be replaced with a
// proper scheduled trigger calling reconcileSubscriptionExpiryNotifications
// directly.
export async function runSubscriptionExpiryReconciliationIfDue(now: Date = new Date()): Promise<void> {
  try {
    const today = todayDateString(now);
    const appSettings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
    const settings = (appSettings?.settings as Record<string, unknown> | null) ?? {};

    if (settings[RECONCILIATION_SETTINGS_KEY] === today) {
      return;
    }

    await reconcileSubscriptionExpiryNotifications(now);

    await prisma.appSettings.update({
      where: { id: "singleton" },
      data: { settings: { ...settings, [RECONCILIATION_SETTINGS_KEY]: today } },
    });
  } catch (error) {
    console.error("Subscription expiry reconciliation failed:", error);
  }
}
