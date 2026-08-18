"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCustomerTicketAction } from "@/lib/tickets/actions";
import { TicketForm, type TechnicianOption } from "./ticket-form";

export function CustomerAddTicketDialog({
  customerId,
  technicians,
}: {
  customerId: string;
  technicians: TechnicianOption[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = createCustomerTicketAction.bind(null, customerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        فتح بلاغ
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>فتح بلاغ جديد</DialogTitle>
          <DialogDescription>أدخل تفاصيل البلاغ لهذا المشترك.</DialogDescription>
        </DialogHeader>
        <TicketForm
          mode="customer"
          fixedCustomerId={customerId}
          technicians={technicians}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
