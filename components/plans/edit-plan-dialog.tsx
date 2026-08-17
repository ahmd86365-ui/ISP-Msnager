"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Plan } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updatePlanAction } from "@/lib/plans/actions";
import { PlanForm } from "./plan-form";

export function EditPlanDialog({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false);
  const boundAction = updatePlanAction.bind(null, plan.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل الباقة</DialogTitle>
          <DialogDescription>{plan.name}</DialogDescription>
        </DialogHeader>
        <PlanForm
          mode="edit"
          plan={plan}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
