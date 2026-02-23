-- Admin profile table for storing human-readable names outside auth metadata.

create table if not exists public.admin_profiles (
  user_id uuid primary key,
  company_id text not null default 'twiga-agm',
  email text,
  full_name text not null,
  phone text,
  role text not null default 'admin',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists idx_admin_profiles_company on public.admin_profiles (company_id);
create index if not exists idx_admin_profiles_email on public.admin_profiles (email);

alter table public.admin_profiles enable row level security;

drop policy if exists admin_profiles_select_own on public.admin_profiles;
create policy admin_profiles_select_own on public.admin_profiles
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists admin_profiles_insert_own on public.admin_profiles;
create policy admin_profiles_insert_own on public.admin_profiles
for insert to authenticated
with check (auth.uid() = user_id and company_id = 'twiga-agm');

drop policy if exists admin_profiles_update_own on public.admin_profiles;
create policy admin_profiles_update_own on public.admin_profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and company_id = 'twiga-agm');
