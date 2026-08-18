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
import { createTicketAction } from "@/lib/tickets/actions";
import { TicketForm, type CustomerOption, type TechnicianOption } from "./ticket-form";

export function AddTicketDialog({
  customers,
  technicians,
}: {
  customers: CustomerOption[];
  technicians: TechnicianOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        فتح بلاغ جديد
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>فتح بلاغ جديد</DialogTitle>
          <DialogDescription>
            اختر المشترك (أو اتركه فارغاً لبلاغ شبكة عام) وأدخل تفاصيل البلاغ.
          </DialogDescription>
        </DialogHeader>
        <TicketForm
          mode="global"
          customers={customers}
          technicians={technicians}
          action={createTicketAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
