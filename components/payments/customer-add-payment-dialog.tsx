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
import { createCustomerPaymentAction } from "@/lib/payments/actions";
import { PaymentForm, type SubscriptionOption } from "./payment-form";

export function CustomerAddPaymentDialog({
  customerId,
  subscriptions,
}: {
  customerId: string;
  subscriptions: SubscriptionOption[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = createCustomerPaymentAction.bind(null, customerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة دفعة
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة دفعة جديدة</DialogTitle>
          <DialogDescription>أدخل بيانات الدفعة لهذا المشترك.</DialogDescription>
        </DialogHeader>
        <PaymentForm
          mode="customer"
          fixedCustomerId={customerId}
          subscriptions={subscriptions}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
