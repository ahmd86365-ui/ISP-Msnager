"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { DistributionPoint } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateDistributionPointAction } from "@/lib/network/distribution-points/actions";
import { DistributionPointForm } from "./distribution-point-form";

export function EditDistributionPointDialog({ point }: { point: DistributionPoint }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateDistributionPointAction.bind(null, point.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل نقطة التوزيع</DialogTitle>
          <DialogDescription>{point.name}</DialogDescription>
        </DialogHeader>
        <DistributionPointForm
          mode="edit"
          point={point}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
