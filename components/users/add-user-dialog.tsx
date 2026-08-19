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
import { createUserAction } from "@/lib/users/actions";
import { UserForm } from "./user-form";

export function AddUserDialog({ canAssignOwner }: { canAssignOwner: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        إضافة مستخدم
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>أنشئ حساب دخول جديد لأحد الموظفين.</DialogDescription>
        </DialogHeader>
        <UserForm
          mode="create"
          canAssignOwner={canAssignOwner}
          action={createUserAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
