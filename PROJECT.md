# ISP Management System — Project Specification

## 1. Project Overview

This project is a web-based administration and operations platform for a small/local ISP (WISP-style) business.

The business receives Internet service from an upstream provider, distributes it through a core router and multiple city distribution points/towers, then uses switches and local distribution infrastructure to serve buildings and homes.

The application should centralize:

- Customers
- Buildings and addresses
- Network topology
- Distribution points
- Network devices and switches
- Switch ports and customer assignments
- Internet plans
- Subscriptions
- Payments and outstanding balances
- Support tickets and maintenance
- Technicians
- Inventory
- Network monitoring
- Reports
- User accounts and permissions

The system should start as a practical MVP and evolve into an ISP operations platform with MikroTik/SNMP/RADIUS integrations.

---

## 2. Product Goals

### Primary goals

1. Reduce manual work.
2. Make customer and subscription information searchable in seconds.
3. Know exactly where each customer is connected in the network.
4. Track payments, renewals, and outstanding balances.
5. Track outages and maintenance.
6. Give the owner a clear operational dashboard.
7. Later automate network actions through integrations.
8. Keep the architecture extensible and vendor-independent.

### Non-goals for MVP

Do NOT implement these in the first version unless explicitly requested:

- Direct MikroTik control
- Automatic customer suspension/reactivation through routers
- RADIUS
- SNMP polling
- WhatsApp integration
- SMS integration
- Customer self-service portal
- Mobile native application
- Advanced accounting
- AI diagnostics

These belong to later phases.

---

## 3. Core Business Model

Network hierarchy:

Upstream ISP
  -> Core Router
  -> Distribution Point / Tower
  -> Switch
  -> Building / Area
  -> Customer CPE / Home
  -> Customer Service

Important: network assignment must be modeled separately from the customer and subscription.

A customer may move from one switch/port to another without losing their historical information.

---

## 4. MVP Modules

### 4.1 Authentication & Users

Roles:

- OWNER
- ADMIN
- ACCOUNTANT
- SUPPORT
- TECHNICIAN

Requirements:

- Secure login
- Password hashing
- Session management
- Role-based authorization
- Audit trail for important actions

### 4.2 Dashboard

Show:

- Total customers
- Active customers
- Suspended customers
- Expired subscriptions
- Subscriptions expiring soon
- Outstanding balances
- Payments today
- Payments this month
- Open tickets
- Open/high-priority tickets
- Network points count
- Devices status placeholder for future monitoring

Dashboard must be useful without network integrations.

### 4.3 Customers

Customer fields should include at minimum:

- Full name
- Phone
- Secondary phone (optional)
- Address
- Building
- Apartment/home identifier
- Notes
- Status
- Customer number
- Created date
- Updated date

Customer profile should show:

- Current subscription
- Payment history
- Balance
- Network assignment
- Tickets
- Service history

### 4.4 Buildings

Each building can have:

- Name
- Address
- Area/neighborhood
- Latitude (optional)
- Longitude (optional)
- Notes
- Distribution point
- Switches
- Customers

### 4.5 Distribution Points

Fields:

- Name
- Code
- Address/area
- Description
- Latitude
- Longitude
- Status
- Notes

A point may contain multiple devices/switches.

### 4.6 Network Devices

Generic device model, vendor independent.

Fields:

- Name
- Hostname
- Device type
- Vendor
- Model
- Serial number
- MAC address
- Management IP
- Distribution point
- Building (optional)
- Status
- Notes

Device types can include:

- ROUTER
- SWITCH
- ACCESS_POINT
- CPE
- OTHER

### 4.7 Switches and Ports

A switch has ports.

Each port should have:

- Port number
- Label
- Status
- Customer assignment (optional)
- Notes

Customer-to-port assignment must have history.

Do not store only the current port on the customer record.

### 4.8 Plans

Plan fields:

- Name
- Description
- Download speed
- Upload speed
- Price
- Billing period
- Active/inactive

Use numeric fields for speeds and money. Avoid storing formatted currency strings.

### 4.9 Subscriptions

Fields:

- Customer
- Plan
- Start date
- End date
- Status
- Price at subscription time
- Notes

Statuses:

- ACTIVE
- EXPIRED
- SUSPENDED
- CANCELLED
- PENDING

Important:
Store the price actually charged at the time of subscription/renewal so historical prices remain correct if plan prices change.

### 4.10 Payments

Fields:

- Customer
- Subscription (optional)
- Amount
- Payment method
- Payment date
- Reference number (optional)
- Notes
- Created by

Payment methods:

- CASH
- TRANSFER
- WALLET
- OTHER

Every payment must have an audit trail.

### 4.11 Tickets

Ticket fields:

- Customer (optional for general network tickets)
- Title
- Description
- Category
- Priority
- Status
- Assigned technician
- Created by
- Resolved by
- Created date
- Resolved date
- Notes

Categories:

- INTERNET_DOWN
- SLOW_SPEED
- SIGNAL
- DEVICE
- CABLE
- BILLING
- INSTALLATION
- OTHER

Priorities:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Statuses:

- OPEN
- IN_PROGRESS
- WAITING
- RESOLVED
- CLOSED

### 4.12 Technicians

Technicians are users with technician role and can receive work.

Track:

- Assigned tickets
- Work history
- Notes
- Completion status

### 4.13 Inventory

MVP inventory:

- Item name
- Category
- SKU/code
- Quantity
- Minimum quantity
- Unit
- Notes

Later support:

- Serial-numbered equipment
- Device assignment
- Purchase/supplier history
- Stock movements

### 4.14 Reports

MVP reports:

- Daily payments
- Monthly payments
- Outstanding balances
- Expired subscriptions
- Expiring subscriptions
- New customers
- Open tickets
- Ticket resolution summary

---

## 5. Network Assignment Model

Use a separate network assignment/history model.

Conceptually:

Customer
  -> NetworkAssignment
      -> SwitchPort
          -> Switch
              -> DistributionPoint

A NetworkAssignment should have:

- Customer
- Switch port (optional)
- Distribution point (optional)
- Device/CPE (optional)
- IP address (optional)
- MAC address (optional)
- Start date
- End date (optional)
- Is current
- Notes

Historical assignments must remain queryable.

Example:

Customer A:
2026-01-01 -> Switch 1 / Port 4
2026-06-01 -> Switch 2 / Port 8

The old assignment must not disappear.

---

## 6. Suggested Database Entities

At minimum:

- User
- Role
- Customer
- Building
- DistributionPoint
- NetworkDevice
- SwitchPort
- NetworkAssignment
- Plan
- Subscription
- Payment
- Ticket
- TicketComment
- InventoryItem
- AuditLog
- Notification

Additional entities may be proposed only when they solve a clear requirement.

---

## 7. Architecture

Recommended stack:

- Next.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui
- Zod
- Auth.js or another secure session/auth solution
- Docker Compose for local PostgreSQL
- Vitest or Jest for unit tests
- Playwright for critical end-to-end tests

Architecture principles:

- Server-side database access
- Clear service layer for business logic
- Validation at API/server boundaries
- No secrets in source code
- No direct database access from client components
- No direct network-device calls from frontend
- Vendor-specific network integrations isolated behind interfaces
- Database changes only through migrations
- Prefer soft deletion/archive for business records where history matters

---

## 8. Suggested Folder Structure

app/
  (auth)/
  (dashboard)/
    dashboard/
    customers/
    buildings/
    network/
    plans/
    subscriptions/
    payments/
    tickets/
    technicians/
    inventory/
    reports/
    settings/
  api/

components/
  ui/
  layout/
  forms/
  tables/
  dashboard/

lib/
  auth/
  db/
  validations/
  services/
  permissions/
  network/
    adapters/
      mikrotik/
      snmp/
      radius/
    interfaces/
  reports/
  notifications/
  utils/

prisma/
  schema.prisma
  seed.ts
  migrations/

tests/
  unit/
  integration/
  e2e/

docs/
  PROJECT.md
  ARCHITECTURE.md
  DATABASE.md
  NETWORK-INTEGRATION.md
  SECURITY.md

---

## 9. UI/UX Requirements

The application is primarily for Arabic-speaking staff.

Requirements:

- Arabic-first UI
- RTL by default
- Responsive/mobile-friendly
- Desktop-friendly
- Clear navigation
- Minimal unnecessary complexity
- Tables should support search, filtering, sorting, pagination
- Important status should use visual indicators
- Destructive actions require confirmation
- Forms should show validation errors clearly

Suggested sidebar:

- لوحة التحكم
- المشتركين
- الشبكة
  - نقاط التوزيع
  - الأبنية
  - الأجهزة
  - السويتشات
- الاشتراكات
  - الباقات
  - الاشتراكات
- المالية
  - الدفعات
  - الديون
  - التقارير
- الدعم
  - الأعطال
  - الفنيين
- المخزون
- الإعدادات

---

## 10. Security Requirements

Must:

- Hash passwords securely.
- Protect all admin routes.
- Enforce authorization server-side.
- Validate all input.
- Use parameterized ORM queries.
- Protect against common web attacks.
- Never expose secrets to the browser.
- Keep network-device credentials encrypted/secure.
- Log important administrative actions.
- Never log passwords, API secrets, or sensitive credentials.
- Use HTTPS in production.
- Use least-privilege access.

---

## 11. Money & Dates

Money:

- Store monetary values as integer minor units or a precise decimal strategy.
- Never use floating-point numbers for money.
- Keep currency configurable, with SYP as an expected deployment currency.
- Do not hard-code formatted currency strings into database fields.

Dates:

- Store timestamps consistently.
- Display dates in the local business timezone.
- Business timezone should be configurable.

---

## 12. Auditability

Important actions should create AuditLog records:

- Customer creation/update/archive
- Subscription creation/renewal/suspension/cancellation
- Payment creation/voiding
- Ticket status changes
- Network assignment changes
- User/role changes
- Important configuration changes

Audit log should contain:

- Actor
- Action
- Entity type
- Entity ID
- Timestamp
- Summary/details
- IP/user-agent when appropriate

---

## 13. Network Integration Strategy

Future integrations must not leak into the rest of the application.

Create an abstraction such as:

NetworkAdapter

Possible implementations:

- MikroTikAdapter
- SNMPAdapter
- RadiusAdapter

The application should ask for business-level operations such as:

- get device status
- get customer/session status
- provision customer
- suspend customer
- reactivate customer

The adapter translates those operations into vendor-specific APIs.

Never make the frontend depend on MikroTik-specific details.

---

## 14. Monitoring Strategy

Future monitoring worker:

1. Load monitored devices.
2. Check connectivity/status.
3. Store status/metrics.
4. Detect transitions.
5. Create network events.
6. Notify relevant users.
7. Associate affected customers where topology permits.

Avoid creating thousands of duplicate alerts for one outage.

Use event deduplication and recovery events.

---

## 15. Customer Diagnosis

Future feature:

A "Diagnose Customer" action should aggregate:

- Account status
- Subscription status
- Payment status
- Network assignment
- Device status
- Switch/port status
- Distribution point status
- Authentication/session status

Output a simple explanation such as:

"Customer account is active. The customer device is reachable, but the distribution point is offline."

The diagnosis must show evidence and must not pretend certainty when data is missing.

---

## 16. Development Phases

### Phase 1 — Foundation

- Repository
- Next.js
- TypeScript
- Tailwind/shadcn
- PostgreSQL
- Prisma
- Docker
- Authentication
- Roles
- Base layout

### Phase 2 — Business Core

- Customers
- Buildings
- Plans
- Subscriptions
- Payments
- Dashboard

### Phase 3 — Network Inventory

- Distribution points
- Devices
- Switches
- Ports
- Network assignments
- Assignment history

### Phase 4 — Support

- Tickets
- Technicians
- Work assignments
- Ticket history

### Phase 5 — Reports & Inventory

- Financial reports
- Subscription reports
- Ticket reports
- Inventory

### Phase 6 — Network Integration

- MikroTik
- SNMP
- RADIUS if needed
- Monitoring
- Network events

### Phase 7 — Automation

- Auto suspension
- Reactivation
- Notifications
- Expiry reminders
- Customer diagnosis

---

## 17. Definition of Done

A feature is not complete until:

- UI works
- Server-side validation exists
- Authorization exists
- Database migration exists if needed
- Loading/error/empty states exist
- Basic tests exist
- No TypeScript errors
- No lint errors
- No obvious console errors
- Business rules are documented
- Existing functionality is not broken

---

## 18. Claude Code Working Rules

Claude Code must:

1. Read PROJECT.md before making changes.
2. Inspect the existing project before proposing implementation.
3. Do not rewrite the whole project for a small feature.
4. Do not change unrelated files.
5. Do not invent requirements silently.
6. If a requirement is ambiguous and materially affects architecture, ask before implementing.
7. Prefer small, reviewable changes.
8. Run relevant tests after changes.
9. Run typecheck/lint before declaring a feature complete.
10. Never expose secrets.
11. Never hard-code credentials.
12. Never make destructive database changes without explicit approval.
13. Use migrations for schema changes.
14. Preserve historical business data.
15. Keep vendor integrations behind adapters.
16. Keep business logic out of UI components where practical.
17. Use reusable components instead of duplicating UI.
18. Prefer accessible forms and controls.
19. Keep Arabic RTL behavior correct.
20. Explain what changed and what was tested after each task.

---

## 19. First Implementation Order

Do not build everything at once.

Start in this order:

1. Project initialization
2. Database connection
3. Prisma schema
4. Authentication
5. Roles/permissions
6. Dashboard shell
7. Customers
8. Buildings
9. Plans
10. Subscriptions
11. Payments
12. Distribution points
13. Network devices
14. Switches/ports
15. Network assignments
16. Tickets
17. Technicians
18. Reports
19. Inventory
20. Tests/refinement
21. MikroTik integration
22. Monitoring

---

## 20. First Claude Code Task

The first task should NOT implement the whole application.

Ask Claude Code to:

- Read PROJECT.md
- Inspect the repository
- Propose architecture
- Identify missing decisions
- Propose Prisma entities and relationships
- Propose folder structure
- Do NOT write application code yet
- Do NOT install large sets of dependencies yet
- Wait for approval before implementation

This keeps the project controlled and reviewable.
