# Security Checklist

## Authentication

- Secure password hashing
- Session expiration
- Logout
- Password reset strategy
- Brute-force/rate-limit strategy where appropriate

## Authorization

Roles:

OWNER
ADMIN
ACCOUNTANT
SUPPORT
TECHNICIAN

Authorization must be checked server-side.

## Secrets

Keep secrets in environment variables or a proper secret manager.

Never commit:

- Database passwords
- MikroTik credentials
- API tokens
- Session secrets
- Encryption keys

## Audit

Log important actions without logging secrets.

## Database

- Use Prisma safely
- Validate input
- Use constraints
- Back up production data
- Test restoration

## Network Devices

Network credentials should not be exposed in browser responses.

Prefer encrypted storage for sensitive integration credentials.

## Production

- HTTPS
- Secure cookies
- Security headers
- Database backups
- Monitoring
- Least privilege
