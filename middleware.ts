import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

// Built directly from the edge-safe authConfig (providers: []) rather than
// importing lib/auth/index.ts — that file pulls in Prisma via the
// Credentials provider, which is not compatible with the Edge runtime this
// middleware executes in. This instance only verifies the session JWT.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)"],
};
