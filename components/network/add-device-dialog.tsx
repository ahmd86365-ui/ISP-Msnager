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
import { createDeviceAction } from "@/lib/network/devices/actions";
import { DeviceForm } from "./device-form";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

interface BuildingOption {
  id: string;
  name: string;
  distributionPointId: string;
}

export function AddDeviceDialog({
  distributionPoints,
  buildings,
}: {
  distributionPoints: DistributionPointOption[];
  buildings: BuildingOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة جهاز
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة جهاز جديد</DialogTitle>
          <DialogDescription>أدخل بيانات الجهاز.</DialogDescription>
        </DialogHeader>
        <DeviceForm
          mode="create"
          distributionPoints={distributionPoints}
          buildings={buildings}
          action={createDeviceAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
