-- Run this in Supabase SQL Editor to make any Gmail admin
-- 1. Update trigger to make all new users admin
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do update set role = 'admin', email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Make all existing profiles admin
update public.profiles set role = 'admin';

-- 3. Make all existing users with gmail admin (if profiles missing)
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users
on conflict (id) do update set role = 'admin';

-- Verify
select email, role from public.profiles;
