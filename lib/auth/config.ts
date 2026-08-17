import type { NextAuthConfig } from "next-auth";

import { env } from "@/lib/env";

// Edge-safe base config: no Prisma / Node-only imports here. middleware.ts
// builds a lightweight auth instance from this file alone (providers: []) to
// verify the session JWT without pulling the database client into the edge
// bundle. lib/auth/index.ts extends this with the real Credentials provider
// for use in Node runtime contexts (route handlers, server actions).
export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");

      if (isLoginPage) {
        // Redirect explicitly instead of returning false here — returning
        // false would send an already-logged-in user back to pages.signIn,
        // which *is* /login, causing an infinite redirect loop.
        return isLoggedIn
          ? Response.redirect(new URL("/", request.nextUrl))
          : true;
      }
      return isLoggedIn;
    },
  },
};
