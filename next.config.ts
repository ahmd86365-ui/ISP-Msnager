import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent `next dev` from injecting an auto-generated agent-rules block
  // into CLAUDE.md — this repo's CLAUDE.md is a hand-maintained governance file.
  agentRules: false,
  // Pin the workspace root to this project so Turbopack doesn't scan upward
  // into unrelated lockfiles in the parent user directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
