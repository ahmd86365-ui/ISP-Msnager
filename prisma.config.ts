import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // --conditions=react-server lets the seed script import server-only
    // guarded app modules (e.g. lib/password.ts) outside of Next.js's own
    // bundler, which is what normally supplies that export condition.
    seed: "node --conditions=react-server prisma/seed.mts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
