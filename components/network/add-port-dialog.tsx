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
import { createPortAction } from "@/lib/network/ports/actions";
import { PortForm } from "./port-form";

export function AddPortDialog({ deviceId }: { deviceId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = createPortAction.bind(null, deviceId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة منفذ
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>إضافة منفذ جديد</DialogTitle>
          <DialogDescription>أدخل بيانات المنفذ على هذا الجهاز.</DialogDescription>
        </DialogHeader>
        <PortForm mode="create" action={boundAction} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
