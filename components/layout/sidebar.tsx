import type { Role } from "@prisma/client";
import { SidebarContent } from "./sidebar-content";

export function Sidebar({ user }: { user: { name: string; role: Role } }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="fixed inset-y-0 start-0 w-64">
        <SidebarContent user={user} />
      </div>
    </aside>
  );
}
