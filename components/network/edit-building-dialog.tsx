"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Building } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateBuildingAction } from "@/lib/network/buildings/actions";
import { BuildingForm } from "./building-form";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

export function EditBuildingDialog({
  building,
  distributionPoints,
}: {
  building: Building;
  distributionPoints: DistributionPointOption[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateBuildingAction.bind(null, building.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل البناء</DialogTitle>
          <DialogDescription>{building.name}</DialogDescription>
        </DialogHeader>
        <BuildingForm
          mode="edit"
          building={building}
          distributionPoints={distributionPoints}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
