# Claude Code Instructions — ISP Management System

## Read First

Before changing anything, read:

- PROJECT.md
- docs/ARCHITECTURE.md if it exists
- docs/DATABASE.md if it exists
- relevant existing source files

PROJECT.md is the primary product specification.

## General Rules

- Do not build the entire application in one step.
- Work in small, reviewable features.
- Inspect existing code before editing.
- Do not rewrite unrelated code.
- Do not invent business requirements.
- Ask before making architectural decisions that materially change the project.
- Keep changes scoped to the current task.
- Preserve existing functionality.
- Prefer simple, maintainable solutions over clever abstractions.

## Technology

Expected stack:

- Next.js
- TypeScript strict mode
- PostgreSQL
- Prisma
- Tailwind CSS
- shadcn/ui
- Zod
- Secure authentication/session solution
- Docker Compose for local development
- Vitest/Jest and Playwright where appropriate

## Architecture

- Keep database access server-side.
- Keep business logic in services/domain modules rather than UI components.
- Validate untrusted input at server boundaries.
- Use Prisma migrations for schema changes.
- Do not modify the database schema manually.
- Do not put secrets in source code.
- Do not expose secrets to client-side code.
- Do not call MikroTik/SNMP/RADIUS directly from frontend code.
- Use network adapters/interfaces for vendor-specific integrations.

## Database

- Preserve historical business records.
- Prefer archive/soft-delete for important business entities.
- Do not hard-delete financial records.
- Do not hard-delete audit logs.
- Never use floating-point numbers for money.
- Keep subscription price history.
- Keep network assignment history.
- Add indexes based on real query patterns.
- Use foreign keys and appropriate constraints.

## Security

- Authorization must be enforced server-side.
- Never trust role information from the client.
- Hash passwords securely.
- Validate every mutation.
- Avoid leaking sensitive information in errors.
- Never log passwords, tokens, API keys, or network credentials.
- Use least privilege.

## UI

- Arabic-first.
- RTL by default.
- Responsive.
- Mobile-friendly.
- Accessible.
- Reusable UI components.
- Consistent loading, empty, success, and error states.
- Confirm destructive actions.

## Testing

For meaningful features:

1. Implement.
2. Run typecheck.
3. Run lint.
4. Run unit/integration tests.
5. Run relevant E2E tests where applicable.
6. Fix failures before declaring complete.

Do not claim tests passed unless they actually ran.

## Git

Prefer focused commits.

Examples:

- feat: add customer management
- feat: add subscription management
- feat: add payment tracking
- feat: add network assignments
- fix: correct subscription expiry calculation

Do not create giant unrelated commits.

## Network Integration

Network integrations are future-facing.

Use an abstraction:

NetworkAdapter
  -> MikroTikAdapter
  -> SNMPAdapter
  -> RadiusAdapter

Do not make the business layer depend directly on MikroTik-specific code.

## Current Priority

Build the business MVP first:

Customers
Buildings
Plans
Subscriptions
Payments
Network inventory
Tickets
Technicians
Reports
Users/roles

Only then implement network automation.

## Response Format After Tasks

After completing a task, report:

1. What changed
2. Files changed
3. Database changes
4. Tests/checks run
5. Any known limitations
6. Suggested next small task

Keep the report concise.
