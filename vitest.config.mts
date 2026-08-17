import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": import.meta.dirname,
      // See tests/setup/server-only-stub.ts for why this is aliased.
      "server-only": path.resolve(
        import.meta.dirname,
        "tests/setup/server-only-stub.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
