# Database Design Notes

## Important Principles

### Customer identity is not network identity

A customer can move between network equipment.

Never make switch/port/IP fields the only source of network truth on Customer.

### Subscription history matters

When a plan price changes, old subscriptions must retain their historical price.

### Payment history is immutable

If a payment needs correction, prefer void/reversal/audit behavior instead of deleting it.

### Network assignment history

Every customer connection change should be recorded.

Example:

Customer 123
- Assignment A: Switch 1 / Port 4, Jan-May
- Assignment B: Switch 2 / Port 8, Jun-current

### Soft deletion

Use archived/inactive flags where historical relationships matter.

## Suggested Relationships

Customer
  1 -> many Subscription

Customer
  1 -> many Payment

Customer
  1 -> many Ticket

Building
  1 -> many Customer

DistributionPoint
  1 -> many Building

DistributionPoint
  1 -> many NetworkDevice

NetworkDevice
  1 -> many SwitchPort

SwitchPort
  1 -> many NetworkAssignment

Customer
  1 -> many NetworkAssignment

Plan
  1 -> many Subscription

Ticket
  1 -> many TicketComment

User
  1 -> many Payment
  1 -> many Ticket
  1 -> many AuditLog

## Recommended Constraints

- Customer number unique
- User email/username unique
- Device management IP unique when present
- Device MAC unique when present
- Serial number unique when present
- Plan name unique
- Payment amount > 0
- Valid subscription dates
- Switch port number unique within a switch
- At most one current network assignment per customer unless explicitly designed otherwise
