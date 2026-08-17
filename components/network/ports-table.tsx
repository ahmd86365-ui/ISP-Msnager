import Link from "next/link";
import type { SwitchPort } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EquipmentStatusBadge } from "@/components/shared/equipment-status-badge";
import { EditPortDialog } from "./edit-port-dialog";

type PortRow = SwitchPort & {
  networkAssignments: {
    customer: { id: string; fullName: string; customerNumber: string };
  }[];
};

export function PortsTable({ deviceId, ports }: { deviceId: string; ports: PortRow[] }) {
  if (ports.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        لا توجد منافذ مسجّلة لهذا الجهاز بعد.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم المنفذ</TableHead>
            <TableHead>التسمية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>المشترك الحالي</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port) => {
            const assignedCustomer = port.networkAssignments[0]?.customer;
            return (
              <TableRow key={port.id}>
                <TableCell dir="ltr" className="text-end font-mono text-foreground">
                  {port.portNumber}
                </TableCell>
                <TableCell className="text-muted-foreground">{port.label ?? "—"}</TableCell>
                <TableCell>
                  <EquipmentStatusBadge status={port.status} />
                </TableCell>
                <TableCell>
                  {assignedCustomer ? (
                    <Link
                      href={`/customers/${assignedCustomer.id}`}
                      className="text-foreground hover:underline"
                    >
                      {assignedCustomer.fullName} — {assignedCustomer.customerNumber}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">غير مرتبط</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    <EditPortDialog deviceId={deviceId} port={port} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
