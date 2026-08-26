# Turf Booking

A sports turf reservation app for Cricket and Football with customer booking flows and an admin operations console.

## Status

The booking engine, Supabase authentication, RLS, admin authorization, pricing, availability, and atomic double-booking protection are implemented. Razorpay checkout and webhook verification are not implemented in this branch, so do not treat the application as production-ready until payment verification and the full test matrix pass.

## Features

- Email/password authentication through Supabase Auth
- Customer dashboard, profile, and booking history
- 30, 60, 90, and 120 minute booking durations
- Database-backed sports and pricing windows
- Server-side price calculation and validation
- Atomic booking creation with overlap protection
- Admin overview, bookings, customers, sports, pricing, slots, analytics, and settings
- RLS policies and server-side customer/admin guards

## Architecture

Next.js 16 App Router renders the UI and server actions. Supabase provides Auth, PostgreSQL, RLS, and booking RPCs. Customer and admin queries use the authenticated server client; browser code only uses the publishable Supabase key.

## Tech stack

- Next.js 16, React 19, TypeScript
- Supabase Auth and PostgreSQL
- Tailwind CSS v4 and local shadcn-style components
- pnpm

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Use a real, controlled mailbox for Supabase email confirmation. Never commit `.env.local` or server secrets.

## Environment variables

Set the Supabase variables listed in `.env.example` and the application URL. Razorpay variables are server-only and should remain unset until the payment implementation is added. Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, or `RAZORPAY_KEY_SECRET` to the browser.

## Database setup

The live Supabase project contains `users`, `sports`, `pricing`, `bookings`, and `payments`, with foreign keys, indexes, RLS policies, signup synchronization, seed sports, pricing windows, and the `create_booking_atomic` function. Verify the schema and policies through the Supabase MCP before deploying changes. Keep schema changes in reviewed migrations for a separately managed production database.

## Development and checks

```bash
pnpm typecheck
pnpm build
pnpm start
```

Before release, exercise the customer and admin flows in a real browser and test ownership isolation with separate sessions. The current repository has no automated test runner configured; add tests before claiming the release gate is complete.

## Payment setup and required tests

Razorpay test mode must be implemented before release. Use test credentials only during development. The required test cases are successful, failed, cancelled, disconnected-frontend, invalid-signature, duplicate-webhook, duplicate-callback, and verification-failure flows. Webhooks must be signature-verified, idempotent, and authoritative for payment state; never trust a client-provided amount or payment status.

## Hostinger VPS deployment

1. Provision a current Linux VPS and create a non-root deploy user.
2. Disable password SSH login and root SSH login; use an SSH key and rotate it as needed.
3. Configure the firewall to allow SSH from trusted IPs plus ports 80 and 443 only.
4. Install Docker and the Compose plugin from the official repository.
5. Store production variables in a protected environment file outside the repository.
6. Build and run the app with a pinned image or commit; do not run development mode.
7. Use Nginx as the public reverse proxy with HTTP-to-HTTPS redirect, request limits, and the app upstream bound to localhost.
8. Use Cloudflare DNS with proxying enabled and Full (strict) TLS. Create the origin certificate on the VPS and keep it out of Git.
9. Use the managed Supabase PostgreSQL database for production unless an explicit self-hosted PostgreSQL migration is planned.
10. Configure structured application logs, Docker log rotation, uptime monitoring, and error alerting.
11. Deploy from a reviewed branch, run the smoke tests, then promote the release.

Example Nginx shape:

```nginx
server {
  listen 80;
  server_name turf.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name turf.example.com;
  # ssl_certificate and ssl_certificate_key are stored outside Git
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Backup and restore

Enable scheduled encrypted PostgreSQL backups with retention and a copy in separate storage, not only on the production VPS. Test restoration into an isolated database at least monthly. A restore runbook should record the backup identifier, restore command for the selected provider, migration/version check, application read-only window, and post-restore smoke tests. Never place backup credentials in the repository.

## Security considerations

RLS is defense in depth, not a replacement for server authorization. Keep role data in protected database columns, scope customer queries by the authenticated user ID, validate booking input and prices on the server, escape rendered user content, use HTTPS, rotate secrets, and review Supabase advisors. Test SQL injection, XSS, CSRF, IDOR/BOLA, privilege escalation, session expiry, unauthorized API access, price manipulation, and secret exposure before release.

## Production checklist

- [ ] Payment creation, verification, and idempotent webhooks implemented
- [ ] All customer and admin functional tests pass
- [ ] Invalid dates, durations, sports, sessions, and overlapping bookings rejected
- [ ] Separate-user ownership and admin authorization tests pass
- [ ] Typecheck, build, and browser smoke tests pass
- [ ] Secrets stored only in the deployment environment
- [ ] HTTPS, firewall, SSH hardening, and Cloudflare configured
- [ ] Automated off-server backups and a tested restore completed
- [ ] Logs and monitoring alerts verified
- [ ] Rollback procedure documented

Until every item is checked, this application is not production-ready.
