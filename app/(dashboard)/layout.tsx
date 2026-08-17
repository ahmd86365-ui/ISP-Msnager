import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guarantees a session for every route under this
  // group, so `user` is always present here. NextAuth's base session type
  // still marks `name` as nullable/optional (it's generic across
  // providers) even though our Credentials authorize() always sets it —
  // normalize once here rather than threading that looseness through every
  // layout component.
  const session = await auth();
  const sessionUser = session!.user;
  const user = {
    id: sessionUser.id,
    name: sessionUser.name ?? sessionUser.username,
    role: sessionUser.role,
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <Sidebar user={user} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header user={user} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
