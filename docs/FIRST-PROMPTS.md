# Claude Code Prompt Sequence

## Prompt 1 — Analyze only

Read PROJECT.md and inspect the repository.

Do not write application code yet.

Analyze the current project and propose:
- architecture
- database entities
- relationships
- folder structure
- dependencies
- implementation risks
- open questions

Do not implement anything until I approve the plan.

## Prompt 2 — Foundation

Implement only the approved project foundation.

Set up:
- Next.js
- TypeScript strict
- Tailwind
- shadcn/ui
- Docker PostgreSQL
- Prisma
- environment variable structure
- basic health check

Do not implement business modules yet.

Run typecheck and lint.

## Prompt 3 — Database

Based on PROJECT.md and the approved design, implement the Prisma schema and migrations.

Do not add unnecessary entities.

Create realistic seed data for:
- users
- customers
- buildings
- points
- devices
- switches/ports
- plans
- subscriptions
- payments
- tickets

Run Prisma validation, typecheck and tests.

## Prompt 4 — Authentication

Implement authentication and roles.

Roles:
OWNER, ADMIN, ACCOUNTANT, SUPPORT, TECHNICIAN.

Protect dashboard routes and enforce authorization server-side.

Do not build business modules yet.

## Prompt 5 — Customers

Implement customer management only.

Include:
- list
- search
- filters
- create
- edit
- detail
- archive

Customer detail should show placeholders/sections for:
- subscription
- payments
- tickets
- network assignment

Do not implement unrelated modules.

## Prompt 6 — Plans and subscriptions

Implement plan management and subscription lifecycle.

Requirements:
- price snapshot
- start/end dates
- status
- renewal
- suspend
- cancel
- validation

Add tests for expiry and renewal rules.

## Prompt 7 — Payments

Implement payments and customer balances.

Requirements:
- create payment
- history
- balance
- daily/monthly summaries
- audit log

Never delete financial history.

## Prompt 8 — Network inventory

Implement:
- buildings
- distribution points
- devices
- switches
- ports
- network assignments
- assignment history

Do not connect to real devices yet.

## Prompt 9 — Tickets

Implement:
- ticket creation
- assignment
- status workflow
- comments
- resolution
- technician views

## Prompt 10 — Dashboard and reports

Build useful dashboard cards and reports using real database data.

Do not use fake statistics in production pages.

## Prompt 11 — Network integration planning

Before writing integration code, inspect the real network and identify:
- router models
- MikroTik versions
- authentication method
- PPPoE/Hotspot/static IP
- switch vendors
- AP vendors
- IP addressing
- VLANs
- monitoring access

Do not make write operations yet.

## Prompt 12 — Read-only MikroTik

Implement a read-only MikroTik adapter.

Test against a safe environment before production.

Do not implement suspension/provisioning yet.

## Prompt 13 — Monitoring

Implement monitoring worker and event deduplication.

## Prompt 14 — Automation

Only after read-only integration is stable, implement controlled:
- suspend
- reactivate
- provisioning

Every action must be authorized and audited.
