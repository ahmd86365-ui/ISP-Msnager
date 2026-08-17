"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Customer } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCustomerAction } from "@/lib/customers/actions";
import { CustomerForm } from "./customer-form";

interface Building {
  id: string;
  name: string;
}

export function EditCustomerDialog({
  customer,
  buildings,
  buttonVariant = "outline",
  buttonSize = "sm",
  showLabel = true,
}: {
  customer: Customer;
  buildings: Building[];
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateCustomerAction.bind(null, customer.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        {showLabel && "تعديل"}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المشترك</DialogTitle>
          <DialogDescription>
            {customer.fullName} — {customer.customerNumber}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          mode="edit"
          customer={customer}
          buildings={buildings}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
