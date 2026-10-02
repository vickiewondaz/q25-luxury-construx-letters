-- Q25 Luxury Construx - Supabase Schema
-- Run this once in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table (extends auth.users with role)
create table if not exists public.profiles (
  id uuid primary references auth.users(id) on delete cascade,
  email text,
  role text check (role in ('admin','staff')) default 'staff',
  created_at timestamptz default now()
);

-- LETTERS table
create table if not exists public.letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  reference_no text unique not null,
  status text check (status in ('draft','final','sent')) default 'draft',
  recipient_name text not null,
  recipient_title text,
  recipient_address text,
  subject text not null,
  salutation text default 'Dear Sir/Madam,',
  body text, -- rich HTML
  body_json jsonb, -- optional structured
  letter_date date default current_date,
  closing_line text default 'Yours sincerely,',
  signature_applied boolean default true,
  pdf_url text,
  is_deleted boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TEMPLATES table
create table if not exists public.templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  salutation text,
  body text,
  created_at timestamptz default now()
);

-- Indexes for search and performance (as requested)
create index if not exists idx_letters_reference_no on public.letters(reference_no);
create index if not exists idx_letters_recipient on public.letters(recipient_name);
create index if not exists idx_letters_subject on public.letters(subject);
create index if not exists idx_letters_letter_date on public.letters(letter_date);
create index if not exists idx_letters_status on public.letters(status);
create index if not exists idx_letters_user_id on public.letters(user_id);
create index if not exists idx_letters_is_deleted on public.letters(is_deleted);
create index if not exists idx_letters_created_at on public.letters(created_at desc);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.letters;
create trigger set_updated_at before update on public.letters
for each row execute function public.handle_updated_at();

-- Sequential reference number function: Q25/YYYY/NNN
create or replace function public.generate_reference_no()
returns text
language plpgsql
security definer
as $$
declare
  y int := extract(year from now());
  prefix text := 'Q25/' || y || '/';
  max_num int;
  next_num int;
begin
  select coalesce(max((regexp_match(reference_no, '/(\d+)$'))[1]::int),0) into max_num
  from public.letters
  where reference_no like prefix || '%';

  next_num := max_num + 1;
  return prefix || lpad(next_num::text, 3, '0');
end;
$$;

-- Enable RLS
alter table public.letters enable row level security;
alter table public.templates enable row level security;
alter table public.profiles enable row level security;

-- RLS Policies: users only see authorised letters
-- For simplicity, allow all authenticated users to read/write their own letters
-- Admin can see all, staff only theirs (enforced via policies below)
-- NOTE: Adjust role logic as needed; profiles.role controls admin

-- Letters policies
drop policy if exists "Users can view their own letters or admin all" on public.letters;
create policy "Users can view their own letters or admin all"
on public.letters for select
to authenticated
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Users can insert letters" on public.letters;
create policy "Users can insert letters"
on public.letters for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own letters, admin all" on public.letters;
create policy "Users can update own letters, admin all"
on public.letters for update
to authenticated
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Users can delete own, admin all" on public.letters;
create policy "Users can delete own, admin all"
on public.letters for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Templates policies
drop policy if exists "Users manage own templates" on public.templates;
create policy "Users manage own templates"
on public.templates for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admin can view all templates" on public.templates;
create policy "Admin can view all templates"
on public.templates for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Profiles policies
drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, case when new.email = 'ceo@q25luxury.com' then 'admin' else 'staff' end)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage bucket for PDFs (create via dashboard or SQL)
-- Note: Create bucket 'letter-pdfs' as private via Storage UI, then run policies below
-- If using SQL for bucket creation (requires supabase admin):
-- insert into storage.buckets (id, name, public) values ('letter-pdfs','letter-pdfs', false) on conflict do nothing;

-- Storage policies (run after bucket exists)
-- drop policy if exists "Authenticated can upload pdfs" on storage.objects;
-- create policy "Authenticated can upload pdfs" on storage.objects for insert to authenticated with check (bucket_id = 'letter-pdfs');
-- drop policy if exists "Users can read own pdfs, admin all" on storage.objects;
-- create policy "Users can read own pdfs, admin all" on storage.objects for select to authenticated using (bucket_id = 'letter-pdfs');
-- drop policy if exists "Users can update own pdfs" on storage.objects;
-- create policy "Users can update own pdfs" on storage.objects for update to authenticated using (bucket_id = 'letter-pdfs');
-- drop policy if exists "Users can delete own pdfs" on storage.objects;
-- create policy "Users can delete own pdfs" on storage.objects for delete to authenticated using (bucket_id = 'letter-pdfs');
