# Supabase handover checklist

The application code is prepared for Supabase, but the live schema and function definitions are managed outside this repository. Run these checks in the Supabase SQL editor with an owner-level connection before production handover.

## Booking notes and RPC

Inspect the deployed function before changing it:

```sql
select
  p.oid::regprocedure as signature,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_guest_booking_atomic', 'create_booking_atomic');
```

Confirm the column exists:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'bookings'
  and column_name = 'notes';
```

If it is missing, apply:

```sql
alter table public.bookings
add column if not exists notes text;
```

The deployed booking RPC must accept `p_notes text default ''` and include that value in its booking insert. Preserve the existing atomic overlap check and idempotency logic; do not replace the complete function until its current definition has been reviewed.

## RLS review

Review enabled RLS and policies:

```sql
select
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('users', 'sports', 'pricing', 'bookings', 'payments');

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('users', 'sports', 'pricing', 'bookings', 'payments')
order by tablename, policyname;
```

Verify that customers cannot change their own role, cannot read another customer's bookings or payment records, and that admin access is granted only through the server-side `users.role = 'admin'` check plus appropriate database policies.

## Consistent profile source

The application uses `public.users` for customer name, mobile number, and role. The profile page and profile mutation now use `users.name` and `users.mobile`. If the live database still depends on a separate `profiles` table, migrate the data and update its policies before deployment; do not silently maintain two sources of truth.

## Atomic booking verification

Run two concurrent booking requests for the same sport, date, and overlapping time range in a controlled test environment. Exactly one should succeed. Confirm that the RPC—not the client—performs overlap checks, price calculation, idempotency handling, and the final insert in one transaction.
