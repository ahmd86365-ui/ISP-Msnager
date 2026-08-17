"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { SwitchPort } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updatePortAction } from "@/lib/network/ports/actions";
import { PortForm } from "./port-form";

export function EditPortDialog({ deviceId, port }: { deviceId: string; port: SwitchPort }) {
  const [open, setOpen] = useState(false);
  const boundAction = updatePortAction.bind(null, deviceId, port.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>تعديل المنفذ</DialogTitle>
          <DialogDescription>منفذ رقم {port.portNumber}</DialogDescription>
        </DialogHeader>
        <PortForm mode="edit" port={port} action={boundAction} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
