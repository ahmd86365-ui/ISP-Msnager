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
import { createPlanAction } from "@/lib/plans/actions";
import { PlanForm } from "./plan-form";

export function AddPlanDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة باقة
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة باقة جديدة</DialogTitle>
          <DialogDescription>أدخل بيانات الباقة.</DialogDescription>
        </DialogHeader>
        <PlanForm mode="create" action={createPlanAction} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
