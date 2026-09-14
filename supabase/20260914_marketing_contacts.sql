-- Run this once in the Supabase SQL editor before enabling the marketing-contact feature.
create table if not exists public.marketing_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null,
  email text not null,
  whatsapp_number text not null,
  marketing_opt_in boolean not null default false,
  consent_at timestamptz,
  consent_source text not null check (consent_source in ('registration', 'profile')),
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_contacts enable row level security;

drop policy if exists "Customers manage their own marketing contact" on public.marketing_contacts;
create policy "Customers manage their own marketing contact"
on public.marketing_contacts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Admins read marketing contacts" on public.marketing_contacts;
create policy "Admins read marketing contacts"
on public.marketing_contacts
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid() and users.role = 'admin'
  )
);

create index if not exists marketing_contacts_opted_in_idx
on public.marketing_contacts (marketing_opt_in)
where marketing_opt_in = true;
