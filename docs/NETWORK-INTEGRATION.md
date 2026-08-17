# Network Integration Plan

## Phase 1 — Read-only

Start with safe read-only operations.

Possible information:

- Device reachable/unreachable
- Device uptime
- CPU/RAM where supported
- Interface status
- Customer session status
- Current traffic
- Signal information where supported

## Phase 2 — Customer status

Use network information to enrich customer diagnosis.

Example:

Customer account: ACTIVE
Subscription: ACTIVE
Device: ONLINE
Switch: ONLINE
Distribution point: OFFLINE

## Phase 3 — Provisioning

Only after extensive testing:

- Create/update customer service
- Apply speed profile
- Update credentials
- Suspend
- Reactivate

## Safety

Network write operations must:

- Be authenticated
- Be authorized
- Be audited
- Be idempotent where possible
- Have clear error handling
- Avoid duplicate actions
- Never expose credentials to frontend

## Vendor Abstraction

Business layer:

provisionCustomer(customerId)
suspendCustomer(customerId)
reactivateCustomer(customerId)
getCustomerStatus(customerId)

Adapter layer:

MikroTikAdapter
SNMPAdapter
RadiusAdapter

The application must not depend on vendor-specific command strings outside adapters.
