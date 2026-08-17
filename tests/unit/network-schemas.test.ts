import { describe, expect, it } from "vitest";

import { distributionPointBaseSchema } from "@/lib/network/distribution-points/schema";
import { buildingBaseSchema } from "@/lib/network/buildings/schema";
import { deviceBaseSchema } from "@/lib/network/devices/schema";
import { portBaseSchema } from "@/lib/network/ports/schema";
import { assignNetworkSchema } from "@/lib/network/assignments/schema";

describe("distributionPointBaseSchema", () => {
  const VALID = { name: "نقطة الحي الشرقي", code: "DP-01", area: "الحي الشرقي" };

  it("accepts a valid distribution point", () => {
    expect(distributionPointBaseSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepts optional lat/lng as empty strings (coerced to undefined)", () => {
    const result = distributionPointBaseSchema.safeParse({ ...VALID, lat: "", lng: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBeUndefined();
      expect(result.data.lng).toBeUndefined();
    }
  });

  it("coerces provided lat/lng to numbers", () => {
    const result = distributionPointBaseSchema.safeParse({ ...VALID, lat: "33.5", lng: "36.3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBe(33.5);
      expect(result.data.lng).toBe(36.3);
    }
  });

  it("rejects a missing code", () => {
    const result = distributionPointBaseSchema.safeParse({ ...VALID, code: "" });
    expect(result.success).toBe(false);
  });
});

describe("buildingBaseSchema", () => {
  const VALID = {
    name: "برج الياسمين",
    address: "شارع الثورة",
    area: "الحي الشرقي",
    distributionPointId: "dp_1",
  };

  it("accepts a valid building", () => {
    expect(buildingBaseSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects a missing distribution point", () => {
    const result = buildingBaseSchema.safeParse({ ...VALID, distributionPointId: "" });
    expect(result.success).toBe(false);
  });
});

describe("deviceBaseSchema", () => {
  const VALID = {
    name: "Core Switch 1",
    type: "SWITCH",
    vendor: "MikroTik",
    model: "CRS326",
    distributionPointId: "dp_1",
  };

  it("accepts a valid device with only required fields", () => {
    const result = deviceBaseSchema.safeParse(VALID);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buildingId).toBeUndefined();
    }
  });

  it("rejects an invalid device type", () => {
    const result = deviceBaseSchema.safeParse({ ...VALID, type: "MODEM" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing vendor", () => {
    const result = deviceBaseSchema.safeParse({ ...VALID, vendor: "" });
    expect(result.success).toBe(false);
  });
});

describe("portBaseSchema", () => {
  it("accepts a valid port and coerces the port number", () => {
    const result = portBaseSchema.safeParse({ portNumber: "5", label: "Uplink" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.portNumber).toBe(5);
    }
  });

  it("rejects a port number of 0", () => {
    expect(portBaseSchema.safeParse({ portNumber: "0" }).success).toBe(false);
  });

  it("rejects a non-integer port number", () => {
    expect(portBaseSchema.safeParse({ portNumber: "3.5" }).success).toBe(false);
  });
});

describe("assignNetworkSchema", () => {
  it("accepts an entirely empty payload (all fields optional)", () => {
    const result = assignNetworkSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.distributionPointId).toBeUndefined();
      expect(result.data.deviceId).toBeUndefined();
      expect(result.data.switchPortId).toBeUndefined();
    }
  });

  it("accepts a fully populated payload", () => {
    const result = assignNetworkSchema.safeParse({
      distributionPointId: "dp_1",
      deviceId: "device_1",
      switchPortId: "port_1",
      ipAddress: "10.0.0.5",
      macAddress: "AA:BB:CC:DD:EE:FF",
      notes: "منفذ رئيسي",
    });
    expect(result.success).toBe(true);
  });
});
