import "server-only";

import { auth } from "./index";
import { isAdminRole } from "./roles";

// Shared gate for the Settings + User Management module — the only place
// in this app that needs anything beyond "is there a session" (see
// lib/auth/roles.ts for why OWNER/ADMIN is the boundary).
export async function requireAdminSession() {
  const session = await auth();
  if (!session || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}
