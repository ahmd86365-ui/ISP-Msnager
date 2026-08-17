import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password.ts";

// Seed runs as a standalone Node script (not through Next.js), so it builds
// its own short-lived Prisma client here rather than importing lib/prisma.ts
// (whose dev-mode singleton caching is only meaningful across hot reloads).
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env first.",
  );
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const DEV_OWNER_PASSWORD = "Owner123!";

async function main() {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "شبكة الأمل لخدمات الإنترنت",
      currency: "SYP",
      timezone: "Asia/Damascus",
    },
  });

  const owner = await prisma.user.upsert({
    where: { username: "owner" },
    update: {},
    create: {
      username: "owner",
      name: "مدير النظام",
      passwordHash: hashPassword(DEV_OWNER_PASSWORD),
      role: "OWNER",
    },
  });

  const dpEast = await prisma.distributionPoint.upsert({
    where: { code: "DP-EAST-01" },
    update: {},
    create: {
      name: "نقطة توزيع - الحي الشرقي",
      code: "DP-EAST-01",
      area: "الحي الشرقي",
      status: "ACTIVE",
    },
  });

  const dpCenter = await prisma.distributionPoint.upsert({
    where: { code: "DP-CENTER-01" },
    update: {},
    create: {
      name: "نقطة توزيع - وسط المدينة",
      code: "DP-CENTER-01",
      area: "وسط المدينة",
      status: "ACTIVE",
    },
  });

  const buildingA = await prisma.building.create({
    data: {
      name: "برج الياسمين",
      address: "شارع الثورة، بناء 12",
      area: "الحي الشرقي",
      distributionPointId: dpEast.id,
    },
  });

  const buildingB = await prisma.building.create({
    data: {
      name: "عمارة النور",
      address: "شارع الجلاء، بناء 5",
      area: "الحي الشرقي",
      distributionPointId: dpEast.id,
    },
  });

  const buildingC = await prisma.building.create({
    data: {
      name: "مجمع الزهراء",
      address: "الساحة العامة، بناء 3",
      area: "وسط المدينة",
      distributionPointId: dpCenter.id,
    },
  });

  const coreSwitch = await prisma.networkDevice.upsert({
    where: { serialNumber: "SN-SW-0001" },
    update: {},
    create: {
      name: "سويتش - برج الياسمين",
      hostname: "sw-east-01",
      type: "SWITCH",
      vendor: "MikroTik",
      model: "CRS326-24G-2S+",
      serialNumber: "SN-SW-0001",
      mac: "AA:BB:CC:00:00:01",
      managementIp: "10.10.1.2",
      status: "ACTIVE",
      distributionPointId: dpEast.id,
      buildingId: buildingA.id,
    },
  });

  const accessPoint = await prisma.networkDevice.upsert({
    where: { serialNumber: "SN-AP-0001" },
    update: {},
    create: {
      name: "نقطة وصول - مجمع الزهراء",
      hostname: "ap-center-01",
      type: "ACCESS_POINT",
      vendor: "Ubiquiti",
      model: "PowerBeam M5",
      serialNumber: "SN-AP-0001",
      mac: "AA:BB:CC:00:00:02",
      managementIp: "10.10.2.2",
      status: "ACTIVE",
      distributionPointId: dpCenter.id,
      buildingId: buildingC.id,
    },
  });

  const ports = await Promise.all(
    Array.from({ length: 8 }, (_, i) => i + 1).map((portNumber) =>
      prisma.switchPort.upsert({
        where: {
          deviceId_portNumber: { deviceId: coreSwitch.id, portNumber },
        },
        update: {},
        create: {
          deviceId: coreSwitch.id,
          portNumber,
          status: "ACTIVE",
        },
      }),
    ),
  );
  const port = (n: number) => ports.find((p) => p.portNumber === n)!;

  const planBasic = await prisma.plan.upsert({
    where: { name: "الباقة الأساسية" },
    update: {},
    create: {
      name: "الباقة الأساسية",
      description: "مناسبة للاستخدام المنزلي الخفيف",
      downloadMbps: 10,
      uploadMbps: 2,
      priceSyp: 50000,
      billingPeriod: "MONTHLY",
    },
  });

  const planStandard = await prisma.plan.upsert({
    where: { name: "الباقة المتوسطة" },
    update: {},
    create: {
      name: "الباقة المتوسطة",
      description: "مناسبة لعائلة متوسطة الاستخدام",
      downloadMbps: 20,
      uploadMbps: 5,
      priceSyp: 80000,
      billingPeriod: "MONTHLY",
    },
  });

  const planPro = await prisma.plan.upsert({
    where: { name: "الباقة المتقدمة" },
    update: {},
    create: {
      name: "الباقة المتقدمة",
      description: "مناسبة للاستخدام الثقيل والألعاب",
      downloadMbps: 50,
      uploadMbps: 10,
      priceSyp: 150000,
      billingPeriod: "MONTHLY",
    },
  });

  const customer1 = await prisma.customer.upsert({
    where: { customerNumber: "C-0001" },
    update: {},
    create: {
      customerNumber: "C-0001",
      fullName: "أحمد الخطيب",
      phone: "0933000001",
      address: "شارع الثورة، بناء 12",
      unitLabel: "شقة 4",
      buildingId: buildingA.id,
      status: "ACTIVE",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { customerNumber: "C-0002" },
    update: {},
    create: {
      customerNumber: "C-0002",
      fullName: "سارة يوسف",
      phone: "0933000002",
      address: "شارع الثورة، بناء 12",
      unitLabel: "شقة 9",
      buildingId: buildingA.id,
      status: "ACTIVE",
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { customerNumber: "C-0003" },
    update: {},
    create: {
      customerNumber: "C-0003",
      fullName: "محمد العلي",
      phone: "0933000003",
      address: "شارع الجلاء، بناء 5",
      unitLabel: "شقة 2",
      buildingId: buildingB.id,
      status: "INACTIVE",
      notes: "توقف عن التجديد منذ شهر تقريباً",
    },
  });

  const customer4 = await prisma.customer.upsert({
    where: { customerNumber: "C-0004" },
    update: {},
    create: {
      customerNumber: "C-0004",
      fullName: "لينا حداد",
      phone: "0933000004",
      address: "شارع الجلاء، بناء 5",
      unitLabel: "شقة 14",
      buildingId: buildingB.id,
      status: "ACTIVE",
    },
  });

  const customer5 = await prisma.customer.upsert({
    where: { customerNumber: "C-0005" },
    update: {},
    create: {
      customerNumber: "C-0005",
      fullName: "خالد ناصر",
      phone: "0933000005",
      address: "الساحة العامة، بناء 3",
      unitLabel: "محل 2",
      buildingId: buildingC.id,
      status: "ACTIVE",
    },
  });

  // Customer 1 — active subscription, fully paid.
  const sub1 = await prisma.subscription.create({
    data: {
      customerId: customer1.id,
      planId: planStandard.id,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      status: "ACTIVE",
      priceAtSubscriptionSyp: planStandard.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer1.id,
      subscriptionId: sub1.id,
      amountSyp: 80000,
      method: "CASH",
      paidAt: new Date("2026-08-02"),
      createdById: owner.id,
    },
  });

  // Customer 2 — active subscription, partial payment (owes 20,000).
  const sub2 = await prisma.subscription.create({
    data: {
      customerId: customer2.id,
      planId: planBasic.id,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      status: "ACTIVE",
      priceAtSubscriptionSyp: planBasic.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer2.id,
      subscriptionId: sub2.id,
      amountSyp: 30000,
      method: "CASH",
      paidAt: new Date("2026-08-03"),
      createdById: owner.id,
    },
  });

  // Customer 3 — lapsed: subscription expired, partial payment left unpaid.
  const sub3 = await prisma.subscription.create({
    data: {
      customerId: customer3.id,
      planId: planStandard.id,
      startDate: new Date("2026-06-05"),
      endDate: new Date("2026-07-05"),
      status: "EXPIRED",
      priceAtSubscriptionSyp: planStandard.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer3.id,
      subscriptionId: sub3.id,
      amountSyp: 40000,
      method: "TRANSFER",
      paidAt: new Date("2026-06-10"),
      reference: "TRX-2026-0610-1",
      createdById: owner.id,
    },
  });

  // Customer 4 — renewal history: an older EXPIRED subscription (fully
  // paid) followed by a new ACTIVE one (partially paid). The old record is
  // untouched, demonstrating that renewals never overwrite history.
  const sub4Old = await prisma.subscription.create({
    data: {
      customerId: customer4.id,
      planId: planBasic.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-07-01"),
      status: "EXPIRED",
      priceAtSubscriptionSyp: planBasic.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer4.id,
      subscriptionId: sub4Old.id,
      amountSyp: 50000,
      method: "CASH",
      paidAt: new Date("2026-06-02"),
      createdById: owner.id,
    },
  });
  const sub4New = await prisma.subscription.create({
    data: {
      customerId: customer4.id,
      planId: planStandard.id,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      status: "ACTIVE",
      priceAtSubscriptionSyp: planStandard.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer4.id,
      subscriptionId: sub4New.id,
      amountSyp: 50000,
      method: "WALLET",
      paidAt: new Date("2026-08-04"),
      createdById: owner.id,
    },
  });

  // Customer 5 — active subscription, fully paid across two payments.
  const sub5 = await prisma.subscription.create({
    data: {
      customerId: customer5.id,
      planId: planPro.id,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-09-01"),
      status: "ACTIVE",
      priceAtSubscriptionSyp: planPro.priceSyp,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer5.id,
      subscriptionId: sub5.id,
      amountSyp: 100000,
      method: "CASH",
      paidAt: new Date("2026-08-01"),
      createdById: owner.id,
    },
  });
  await prisma.payment.create({
    data: {
      customerId: customer5.id,
      subscriptionId: sub5.id,
      amountSyp: 50000,
      method: "CASH",
      paidAt: new Date("2026-08-15"),
      createdById: owner.id,
    },
  });

  // Network assignments — wired customers via the switch, one customer
  // wireless via the access point, and one customer showing a port change
  // (history preserved, not overwritten).
  await prisma.networkAssignment.create({
    data: {
      customerId: customer1.id,
      switchPortId: port(1).id,
      deviceId: coreSwitch.id,
      distributionPointId: dpEast.id,
      ipAddress: "10.20.1.11",
      startDate: new Date("2026-08-01"),
      isCurrent: true,
    },
  });

  await prisma.networkAssignment.create({
    data: {
      customerId: customer2.id,
      switchPortId: port(2).id,
      deviceId: coreSwitch.id,
      distributionPointId: dpEast.id,
      ipAddress: "10.20.1.12",
      startDate: new Date("2026-08-01"),
      isCurrent: true,
    },
  });

  // Customer 4 moved from port 4 to port 5 — old row closed, new row current.
  await prisma.networkAssignment.create({
    data: {
      customerId: customer4.id,
      switchPortId: port(4).id,
      deviceId: coreSwitch.id,
      distributionPointId: dpEast.id,
      ipAddress: "10.20.1.14",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-08-01"),
      isCurrent: false,
      notes: "تم نقل التوصيل إلى المنفذ 5 بسبب إعادة ترتيب الكابلات",
    },
  });
  await prisma.networkAssignment.create({
    data: {
      customerId: customer4.id,
      switchPortId: port(5).id,
      deviceId: coreSwitch.id,
      distributionPointId: dpEast.id,
      ipAddress: "10.20.1.15",
      startDate: new Date("2026-08-01"),
      isCurrent: true,
    },
  });

  // Customer 3 — lapsed, disconnected (no current assignment).
  await prisma.networkAssignment.create({
    data: {
      customerId: customer3.id,
      switchPortId: port(7).id,
      deviceId: coreSwitch.id,
      distributionPointId: dpEast.id,
      ipAddress: "10.20.1.17",
      startDate: new Date("2026-06-05"),
      endDate: new Date("2026-07-10"),
      isCurrent: false,
      notes: "تم فصل التوصيل بعد انتهاء الاشتراك دون تجديد",
    },
  });

  // Customer 5 — wireless via the access point, no switch port.
  await prisma.networkAssignment.create({
    data: {
      customerId: customer5.id,
      deviceId: accessPoint.id,
      distributionPointId: dpCenter.id,
      ipAddress: "10.20.2.15",
      macAddress: "F0:9F:C2:11:22:33",
      startDate: new Date("2026-08-01"),
      isCurrent: true,
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      customerId: customer5.id,
      title: "لا يوجد إنترنت نهائياً",
      description: "العميل يفيد بانقطاع كامل للخدمة منذ الصباح.",
      category: "INTERNET_DOWN",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      createdById: owner.id,
      assignedTechnicianId: owner.id,
    },
  });
  await prisma.ticketComment.create({
    data: {
      ticketId: ticket1.id,
      authorId: owner.id,
      body: "تم فحص نقطة الوصول عن بعد، الجهاز غير مستجيب. سيتم الذهاب ميدانياً.",
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      customerId: customer2.id,
      title: "بطء ملحوظ في السرعة",
      description: "العميلة تشتكي من بطء السرعة خلال المساء.",
      category: "SLOW_SPEED",
      priority: "MEDIUM",
      status: "RESOLVED",
      createdById: owner.id,
      assignedTechnicianId: owner.id,
      resolvedById: owner.id,
      resolvedAt: new Date("2026-08-10"),
    },
  });
  await prisma.ticketComment.create({
    data: {
      ticketId: ticket2.id,
      authorId: owner.id,
      body: "تبيّن أن السبب ازدحام الشبكة في وقت الذروة، تم ترقية الباقة للعميلة.",
    },
  });
  await prisma.ticketComment.create({
    data: {
      ticketId: ticket2.id,
      authorId: owner.id,
      body: "تم التأكد من تحسن السرعة بعد الترقية. إغلاق التذكرة.",
    },
  });

  await prisma.inventoryItem.upsert({
    where: { sku: "CBL-CAT6" },
    update: {},
    create: {
      name: "كابل شبكة CAT6",
      category: "كابلات",
      sku: "CBL-CAT6",
      quantity: 500,
      minQuantity: 100,
      unit: "متر",
    },
  });
  await prisma.inventoryItem.upsert({
    where: { sku: "RTR-TPLINK-HOME" },
    update: {},
    create: {
      name: "راوتر منزلي TP-Link",
      category: "أجهزة",
      sku: "RTR-TPLINK-HOME",
      quantity: 15,
      minQuantity: 5,
      unit: "قطعة",
    },
  });
  await prisma.inventoryItem.upsert({
    where: { sku: "CON-RJ45" },
    update: {},
    create: {
      name: "موصلات RJ45",
      category: "مستلزمات",
      sku: "CON-RJ45",
      quantity: 300,
      minQuantity: 50,
      unit: "قطعة",
    },
  });

  console.log("Seed complete.");
  console.log(
    `Development-only OWNER login -> username: "owner", password: "${DEV_OWNER_PASSWORD}" (do not use in production).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
