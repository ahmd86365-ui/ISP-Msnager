// Test-only stand-in for the "server-only" package (aliased in
// vitest.config.mts). That package throws unless the bundler passes Next.js's
// "react-server" export condition, which Vitest doesn't set — this no-op
// keeps server-only-guarded modules importable in unit tests.
export {};
