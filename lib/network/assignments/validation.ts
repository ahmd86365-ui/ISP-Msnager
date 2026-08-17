// Pure "does X belong to Y" checks, kept separate from service.ts's Prisma
// calls so they're directly unit-testable without a live database (this
// project's test environment has no DB — see
// tests/unit/network-assignments-validation.test.ts). Client-supplied
// deviceId/switchPortId are never trusted at face value: the service layer
// fetches the real parent id from the DB and runs it through these checks
// before writing an assignment.

export function deviceBelongsToDistributionPoint(
  deviceDistributionPointId: string,
  distributionPointId: string,
): boolean {
  return deviceDistributionPointId === distributionPointId;
}

export function portBelongsToDevice(portDeviceId: string, deviceId: string): boolean {
  return portDeviceId === deviceId;
}
