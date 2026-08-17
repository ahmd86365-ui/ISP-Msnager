"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { NetworkDevice } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateDeviceAction } from "@/lib/network/devices/actions";
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

export function EditDeviceDialog({
  device,
  distributionPoints,
  buildings,
  buttonVariant = "ghost",
  buttonSize = "icon-sm",
  showLabel = false,
}: {
  device: NetworkDevice;
  distributionPoints: DistributionPointOption[];
  buildings: BuildingOption[];
  buttonVariant?: "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "default" | "icon-sm";
  showLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateDeviceAction.bind(null, device.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={buttonVariant} size={buttonSize} onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        {showLabel ? "تعديل" : <span className="sr-only">تعديل</span>}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل الجهاز</DialogTitle>
          <DialogDescription>{device.name}</DialogDescription>
        </DialogHeader>
        <DeviceForm
          mode="edit"
          device={device}
          distributionPoints={distributionPoints}
          buildings={buildings}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
