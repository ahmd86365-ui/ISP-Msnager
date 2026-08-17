# Architecture

## High-Level

Browser
  -> Next.js UI
  -> Server actions/API
  -> Services
  -> Prisma
  -> PostgreSQL

Future:

Services
  -> Network Adapter
      -> MikroTik
      -> SNMP
      -> RADIUS

## Layer Responsibilities

### UI

Responsible for:

- Rendering
- User interaction
- Form state
- Displaying validation/results

Must not contain core business rules.

### Server/API

Responsible for:

- Authentication
- Authorization
- Input validation
- Calling services
- Returning safe results

### Services

Responsible for:

- Business rules
- Subscription lifecycle
- Payment rules
- Ticket workflows
- Network assignment rules

### Data Access

Prisma is responsible for database persistence.

Do not scatter raw database operations across UI components.

### Network Adapters

Network adapters translate generic application operations into vendor-specific operations.

Example:

interface NetworkAdapter {
  getDeviceStatus(...)
  getCustomerStatus(...)
  provisionCustomer(...)
  suspendCustomer(...)
  reactivateCustomer(...)
}

MikroTik-specific code must stay inside the MikroTik adapter.

## Deployment

Development:

Docker PostgreSQL
+
Next.js local server

Production can use:

- VPS/cloud server
- Managed PostgreSQL or PostgreSQL on VPS
- Reverse proxy
- HTTPS
- Backups

Exact deployment platform is intentionally not fixed yet.
