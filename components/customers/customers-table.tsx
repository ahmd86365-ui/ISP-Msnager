import Link from "next/link";
import { Eye } from "lucide-react";
import type { Customer } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerStatusBadge } from "./customer-status-badge";
import { EditCustomerDialog } from "./edit-customer-dialog";
import { ArchiveCustomerDialog } from "./archive-customer-dialog";
import { DeleteCustomerDialog } from "./delete-customer-dialog";

interface Building {
  id: string;
  name: string;
}

type CustomerRow = Customer & { building: { name: string } };

export function CustomersTable({
  customers,
  buildings,
}: {
  customers: CustomerRow[];
  buildings: Building[];
}) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          لا يوجد مشتركون مطابقون
        </p>
        <p className="text-sm text-muted-foreground">
          جرّب تعديل البحث أو الفلاتر، أو أضف مشتركاً جديداً.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم المشترك</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>البناء</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-mono text-muted-foreground">
                {customer.customerNumber}
              </TableCell>
              <TableCell>
                <Link
                  href={`/customers/${customer.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {customer.fullName}
                </Link>
              </TableCell>
              <TableCell dir="ltr" className="text-end text-muted-foreground">
                {customer.phone}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {customer.building.name}
              </TableCell>
              <TableCell>
                <CustomerStatusBadge status={customer.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/customers/${customer.id}`} />}
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">عرض</span>
                  </Button>
                  <EditCustomerDialog
                    customer={customer}
                    buildings={buildings}
                    buttonVariant="ghost"
                    buttonSize="icon-sm"
                    showLabel={false}
                  />
                  {customer.status !== "ARCHIVED" && (
                    <ArchiveCustomerDialog
                      customerId={customer.id}
                      customerName={customer.fullName}
                      buttonVariant="ghost"
                      buttonSize="icon-sm"
                      showLabel={false}
                    />
                  )}
                  <DeleteCustomerDialog
                    customerId={customer.id}
                    customerName={customer.fullName}
                    buttonVariant="ghost"
                    buttonSize="icon-sm"
                    showLabel={false}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
