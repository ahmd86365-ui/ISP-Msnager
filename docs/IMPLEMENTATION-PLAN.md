# Implementation Plan

## Step 0 — Repository inspection

Claude Code should inspect the repository and report:

- Current files
- Existing framework
- Node version
- Package manager
- Existing dependencies
- Existing configuration

Do not rewrite the project if an existing application already exists.

## Step 1 — Foundation

- Initialize/verify Next.js
- TypeScript strict
- Tailwind
- shadcn/ui
- Docker Compose
- PostgreSQL
- Prisma
- Environment variables
- Basic health check

## Step 2 — Database

Design and review entities:

User
Customer
Building
DistributionPoint
NetworkDevice
SwitchPort
NetworkAssignment
Plan
Subscription
Payment
Ticket
TicketComment
InventoryItem
AuditLog
Notification

Create migrations and seed data.

## Step 3 — Authentication

- Login
- Sessions
- Roles
- Protected routes
- Server-side authorization

## Step 4 — Customers

- List
- Search
- Filter
- Create
- Edit
- Customer detail
- Payment history
- Subscription history
- Ticket history
- Network assignment summary

## Step 5 — Subscriptions and Plans

- CRUD plans
- Create subscription
- Renew
- Suspend
- Cancel
- Expiry calculations
- Price snapshots

## Step 6 — Payments

- Create payment
- Payment history
- Customer balance
- Daily/monthly reports
- Prevent accidental duplicate submission

## Step 7 — Network Inventory

- Distribution points
- Devices
- Switches
- Ports
- Buildings
- Network assignments
- Assignment history

## Step 8 — Tickets

- Create ticket
- Assign technician
- Status workflow
- Comments
- Resolution history

## Step 9 — Reports

Start with server-generated query/report pages.

Avoid unnecessary PDF/export complexity until the core reports are correct.

## Step 10 — Network Integration

Only after the MVP is stable:

- MikroTik adapter
- Read-only health/status first
- Then customer/session status
- Then provisioning
- Then suspend/reactivate

Never begin with destructive/write operations.

## Step 11 — Monitoring

- Poll devices
- Store status
- Detect outages
- Deduplicate events
- Notify
- Associate impacted customers

## Step 12 — Diagnosis

Combine:

- Customer account
- Subscription
- Payment
- Network assignment
- Device
- Switch
- Point
- Session/health

into a human-readable diagnostic view.
