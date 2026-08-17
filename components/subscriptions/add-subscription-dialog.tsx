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
import { createSubscriptionAction } from "@/lib/subscriptions/actions";
import { SubscriptionPlanForm, type PlanOption } from "./subscription-plan-form";

export function AddSubscriptionDialog({
  customerId,
  plans,
}: {
  customerId: string;
  plans: PlanOption[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = createSubscriptionAction.bind(null, customerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        اشتراك جديد
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إنشاء اشتراك جديد</DialogTitle>
          <DialogDescription>
            اختر باقة لإنشاء اشتراك جديد لهذا المشترك. سيُحسب تاريخ الانتهاء تلقائياً
            حسب دورة فوترة الباقة.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionPlanForm
          mode="create"
          plans={plans}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
