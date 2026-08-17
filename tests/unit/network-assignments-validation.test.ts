import { describe, expect, it } from "vitest";

import {
  deviceBelongsToDistributionPoint,
  portBelongsToDevice,
} from "@/lib/network/assignments/validation";

describe("deviceBelongsToDistributionPoint", () => {
  it("returns true when the device's distribution point matches", () => {
    expect(deviceBelongsToDistributionPoint("dp_1", "dp_1")).toBe(true);
  });

  it("returns false when the device belongs to a different distribution point", () => {
    expect(deviceBelongsToDistributionPoint("dp_1", "dp_2")).toBe(false);
  });
});

describe("portBelongsToDevice", () => {
  it("returns true when the port's device matches", () => {
    expect(portBelongsToDevice("device_1", "device_1")).toBe(true);
  });

  it("returns false when the port belongs to a different device", () => {
    expect(portBelongsToDevice("device_1", "device_2")).toBe(false);
  });
});
