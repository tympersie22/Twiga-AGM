-- Prevent privilege escalation via direct updates to admin_profiles.role.

-- Allow authenticated users to create only manager profiles for themselves.
drop policy if exists admin_profiles_insert_own on public.admin_profiles;
create policy admin_profiles_insert_own on public.admin_profiles
for insert to authenticated
with check (
  auth.uid() = user_id
  and company_id = 'twiga-agm'
  and role = 'manager'
);

-- Allow authenticated users to update their own profile, but keep role unchanged.
drop policy if exists admin_profiles_update_own on public.admin_profiles;
create policy admin_profiles_update_own on public.admin_profiles
for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and company_id = 'twiga-agm'
  and role = (
    select ap.role
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
  )
);
