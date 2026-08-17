"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { changeSubscriptionPlanAction } from "@/lib/subscriptions/actions";
import { SubscriptionPlanForm, type PlanOption } from "./subscription-plan-form";

export function ChangePlanDialog({
  customerId,
  currentSubscriptionId,
  plans,
}: {
  customerId: string;
  currentSubscriptionId: string;
  plans: PlanOption[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = changeSubscriptionPlanAction.bind(
    null,
    customerId,
    currentSubscriptionId,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <RefreshCw className="size-4" />
        تغيير / تجديد الباقة
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تغيير أو تجديد الباقة</DialogTitle>
          <DialogDescription>
            سيتم إنهاء الاشتراك الحالي وإنشاء اشتراك جديد بالسعر الحالي للباقة
            المختارة. يبقى الاشتراك السابق محفوظاً ضمن السجل التاريخي.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionPlanForm
          mode="change"
          plans={plans}
          action={boundAction}
          onSuccess={() => setOpen(false)}
          submitLabel="تأكيد التغيير/التجديد"
        />
      </DialogContent>
    </Dialog>
  );
}
