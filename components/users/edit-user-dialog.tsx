"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUserAction } from "@/lib/users/actions";
import { UserForm } from "./user-form";

export function EditUserDialog({
  user,
  canAssignOwner,
}: {
  user: { id: string; name: string; username: string; role: Role };
  canAssignOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateUserAction.bind(null, user.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        <span className="sr-only">تعديل</span>
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription>
            {user.name} — {user.username}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          mode="edit"
          user={user}
          canAssignOwner={canAssignOwner}
          action={boundAction}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
