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
import { createBuildingAction } from "@/lib/network/buildings/actions";
import { BuildingForm } from "./building-form";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

export function AddBuildingDialog({
  distributionPoints,
}: {
  distributionPoints: DistributionPointOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة بناء
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة بناء جديد</DialogTitle>
          <DialogDescription>أدخل بيانات البناء.</DialogDescription>
        </DialogHeader>
        <BuildingForm
          mode="create"
          distributionPoints={distributionPoints}
          action={createBuildingAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
