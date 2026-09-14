-- Create this email in Supabase Auth first, then run this SQL to grant admin access.
-- Do not store the admin password in Git or in a client-visible environment variable.

insert into public.users (id, email, name, mobile, role, created_at)
select
  auth_users.id,
  auth_users.email,
  coalesce(auth_users.raw_user_meta_data->>'name', 'Admin'),
  auth_users.raw_user_meta_data->>'mobile',
  'admin',
  coalesce(auth_users.created_at, now())
from auth.users as auth_users
where lower(auth_users.email) = 'admin@testing.com'
on conflict (id) do update
set
  email = excluded.email,
  name = coalesce(nullif(public.users.name, ''), excluded.name),
  role = 'admin';
