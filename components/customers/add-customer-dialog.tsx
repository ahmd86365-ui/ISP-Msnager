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
import { createCustomerAction } from "@/lib/customers/actions";
import { CustomerForm } from "./customer-form";

interface Building {
  id: string;
  name: string;
}

export function AddCustomerDialog({ buildings }: { buildings: Building[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة مشترك
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة مشترك جديد</DialogTitle>
          <DialogDescription>أدخل بيانات المشترك الأساسية.</DialogDescription>
        </DialogHeader>
        <CustomerForm
          mode="create"
          buildings={buildings}
          action={createCustomerAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
