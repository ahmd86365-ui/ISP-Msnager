import type { Role } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusTag } from "@/components/shared/status-tag";
import { UserRoleBadge } from "./user-role-badge";
import { EditUserDialog } from "./edit-user-dialog";
import { SetActiveDialog } from "./set-active-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

interface UserRow {
  id: string;
  name: string;
  username: string;
  role: Role;
  isActive: boolean;
}

export function UsersTable({
  users,
  currentUserId,
  currentUserRole,
}: {
  users: UserRow[];
  currentUserId: string;
  currentUserRole: Role;
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-base font-medium text-foreground">لا يوجد مستخدمون مطابقون</p>
        <p className="text-sm text-muted-foreground">جرّب تعديل البحث أو الفلاتر.</p>
      </div>
    );
  }

  const canAssignOwner = currentUserRole === "OWNER";

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>اسم المستخدم</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const canManage = user.role !== "OWNER" || currentUserRole === "OWNER";
            const isSelf = user.id === currentUserId;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                <TableCell dir="ltr" className="text-end text-muted-foreground">
                  {user.username}
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <StatusTag color="var(--status-good)" tint="bg-status-good/10" label="نشط" />
                  ) : (
                    <StatusTag color="var(--muted-foreground)" tint="bg-muted" label="غير نشط" />
                  )}
                </TableCell>
                <TableCell>
                  {canManage ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <EditUserDialog user={user} canAssignOwner={canAssignOwner} />
                      <ResetPasswordDialog userId={user.id} userName={user.name} />
                      {!isSelf && (
                        <SetActiveDialog
                          userId={user.id}
                          userName={user.name}
                          isActive={user.isActive}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-end text-xs text-muted-foreground">
                      يديره المالك فقط
                    </p>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
