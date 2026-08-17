import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// next-auth's own "next-auth" / "next-auth/jwt" entrypoints re-export these
// types from @auth/core rather than declaring them, so augmenting those
// entrypoints wouldn't merge into the interfaces actually used internally.
// The augmentation has to target @auth/core's modules directly.
declare module "@auth/core/types" {
  interface User {
    id: string;
    username: string;
    role: Role;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
  }
}
