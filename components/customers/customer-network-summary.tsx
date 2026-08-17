import type {
  DistributionPoint,
  NetworkAssignment,
  NetworkDevice,
  SwitchPort,
} from "@prisma/client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AssignNetworkDialog,
  type NetworkTreePoint,
} from "@/components/network/assign-network-dialog";

type NetworkSummary =
  | (NetworkAssignment & {
      switchPort: Pick<SwitchPort, "portNumber"> | null;
      device: Pick<NetworkDevice, "name" | "type"> | null;
      distributionPoint: Pick<DistributionPoint, "name"> | null;
    })
  | null;

export function CustomerNetworkSummary({
  customerId,
  assignment,
  networkTree,
}: {
  customerId: string;
  assignment: NetworkSummary;
  networkTree: NetworkTreePoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الشبكة</CardTitle>
        <CardAction>
          <AssignNetworkDialog
            customerId={customerId}
            tree={networkTree}
            hasCurrentAssignment={Boolean(assignment)}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {!assignment ? (
          <p className="text-sm text-muted-foreground">
            لا يوجد تعيين شبكي حالي لهذا المشترك.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
            {assignment.device && (
              <>
                <dt className="text-muted-foreground">الجهاز</dt>
                <dd className="text-end text-foreground">
                  {assignment.device.name}
                </dd>
              </>
            )}
            {assignment.switchPort && (
              <>
                <dt className="text-muted-foreground">المنفذ</dt>
                <dd className="text-end text-foreground">
                  {assignment.switchPort.portNumber}
                </dd>
              </>
            )}
            {assignment.distributionPoint && (
              <>
                <dt className="text-muted-foreground">نقطة التوزيع</dt>
                <dd className="text-end text-foreground">
                  {assignment.distributionPoint.name}
                </dd>
              </>
            )}
            {assignment.ipAddress && (
              <>
                <dt className="text-muted-foreground">عنوان IP</dt>
                <dd dir="ltr" className="text-end font-mono text-foreground">
                  {assignment.ipAddress}
                </dd>
              </>
            )}
            {assignment.macAddress && (
              <>
                <dt className="text-muted-foreground">عنوان MAC</dt>
                <dd dir="ltr" className="text-end font-mono text-foreground">
                  {assignment.macAddress}
                </dd>
              </>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
