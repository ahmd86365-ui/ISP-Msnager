import type { Role } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/customers/pagination-controls";
import { NotAuthorized } from "@/components/shared/not-authorized";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersFilters } from "@/components/users/users-filters";
import { UsersTable } from "@/components/users/users-table";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getAppSettings } from "@/lib/settings/queries";
import { listUsers } from "@/lib/users/queries";
import { formatNumber } from "@/lib/format";

const ALL_ROLES: Role[] = ["OWNER", "ADMIN", "ACCOUNTANT", "SUPPORT", "TECHNICIAN"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  const sessionUser = session!.user;

  if (!isAdminRole(sessionUser.role)) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-foreground">الإعدادات</h1>
        <NotAuthorized />
      </div>
    );
  }

  const params = await searchParams;
  const role = ALL_ROLES.includes(params.role as Role) ? (params.role as Role) : undefined;
  const isActive =
    params.status === "active" ? true : params.status === "inactive" ? false : undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [appSettings, { users, total, pageCount, pageSize }] = await Promise.all([
    getAppSettings(),
    listUsers({ search: params.q, role, isActive, page }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">
          إعدادات المنشأة العامة وإدارة حسابات المستخدمين.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات المنشأة العامة</CardTitle>
        </CardHeader>
        <CardContent>
          {appSettings && <GeneralSettingsForm settings={appSettings} />}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">المستخدمون</h2>
          <p className="text-sm text-muted-foreground">
            {formatNumber(total)} مستخدم إجمالاً
          </p>
        </div>
        <AddUserDialog canAssignOwner={sessionUser.role === "OWNER"} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <UsersFilters />
          <UsersTable
            users={users}
            currentUserId={sessionUser.id}
            currentUserRole={sessionUser.role}
          />
          {total > 0 && (
            <PaginationControls
              page={page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
