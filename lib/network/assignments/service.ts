import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { deviceBelongsToDistributionPoint, portBelongsToDevice } from "./validation";

export class InvalidDeviceForDistributionPointError extends Error {
  constructor() {
    super("Device does not belong to the given distribution point");
    this.name = "InvalidDeviceForDistributionPointError";
  }
}

export class InvalidPortForDeviceError extends Error {
  constructor() {
    super("Switch port does not belong to the given device");
    this.name = "InvalidPortForDeviceError";
  }
}

export class ConcurrentAssignmentChangeError extends Error {
  constructor() {
    super("Customer's current assignment changed concurrently, retry");
    this.name = "ConcurrentAssignmentChangeError";
  }
}

// Moves (or makes, if this is the first one) a customer's network
// assignment. Never mutates a past assignment's dates — the previous
// isCurrent row is closed (isCurrent=false, endDate=now) and a brand new
// row is created, exactly mirroring how lib/subscriptions/service.ts
// handles plan changes/renewals. Client-supplied deviceId/switchPortId are
// never trusted at face value: both are re-verified server-side against the
// distribution point / device they're claimed to belong to.
export async function assignCustomerToNetwork(params: {
  customerId: string;
  distributionPointId?: string;
  deviceId?: string;
  switchPortId?: string;
  ipAddress?: string;
  macAddress?: string;
  notes?: string;
  actorId: string;
}) {
  if (params.deviceId && params.distributionPointId) {
    const device = await prisma.networkDevice.findUnique({
      where: { id: params.deviceId },
      select: { distributionPointId: true },
    });
    if (
      !device ||
      !deviceBelongsToDistributionPoint(device.distributionPointId, params.distributionPointId)
    ) {
      throw new InvalidDeviceForDistributionPointError();
    }
  }

  if (params.switchPortId && params.deviceId) {
    const port = await prisma.switchPort.findUnique({
      where: { id: params.switchPortId },
      select: { deviceId: true },
    });
    if (!port || !portBelongsToDevice(port.deviceId, params.deviceId)) {
      throw new InvalidPortForDeviceError();
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.networkAssignment.findFirst({
        where: { customerId: params.customerId, isCurrent: true },
      });

      const now = new Date();

      if (current) {
        await tx.networkAssignment.update({
          where: { id: current.id },
          data: { isCurrent: false, endDate: now },
        });
      }

      const next = await tx.networkAssignment.create({
        data: {
          customerId: params.customerId,
          distributionPointId: params.distributionPointId,
          deviceId: params.deviceId,
          switchPortId: params.switchPortId,
          ipAddress: params.ipAddress,
          macAddress: params.macAddress,
          notes: params.notes,
          startDate: now,
          isCurrent: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: params.actorId,
          action: current ? "NETWORK_ASSIGNMENT_CHANGED" : "NETWORK_ASSIGNMENT_CREATED",
          entityType: "NetworkAssignment",
          entityId: next.id,
          summary: current
            ? "تم نقل/تعديل ربط المشترك بالشبكة"
            : "تم ربط المشترك بالشبكة",
        },
      });

      return next;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConcurrentAssignmentChangeError();
    }
    throw err;
  }
}
