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
import { createDistributionPointAction } from "@/lib/network/distribution-points/actions";
import { DistributionPointForm } from "./distribution-point-form";

export function AddDistributionPointDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة نقطة توزيع
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة نقطة توزيع جديدة</DialogTitle>
          <DialogDescription>أدخل بيانات نقطة التوزيع.</DialogDescription>
        </DialogHeader>
        <DistributionPointForm
          mode="create"
          action={createDistributionPointAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
