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
import { createPaymentAction } from "@/lib/payments/actions";
import { PaymentForm, type CustomerOption } from "./payment-form";

export function AddPaymentDialog({ customers }: { customers: CustomerOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة دفعة
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة دفعة جديدة</DialogTitle>
          <DialogDescription>اختر المشترك وأدخل بيانات الدفعة.</DialogDescription>
        </DialogHeader>
        <PaymentForm
          mode="global"
          customers={customers}
          action={createPaymentAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
