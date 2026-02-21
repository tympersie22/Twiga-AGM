-- Harden RLS for admin operations.
-- Keep public web reads where needed, but remove anon admin writes.

-- Rooms: public read, authenticated write only

drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms
for insert to authenticated
with check (company_id = 'twiga-agm');

drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms
for update to authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Bookings: allow anon insert for public booking flow, authenticated update only

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
for update to authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Payments: allow anon insert for public booking flow, authenticated update only

drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists payments_update on public.payments;
create policy payments_update on public.payments
for update to authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Admin logs: authenticated only (no anon writes)

drop policy if exists admin_logs_select on public.admin_logs;
create policy admin_logs_select on public.admin_logs
for select to authenticated
using (company_id = 'twiga-agm');

drop policy if exists admin_logs_insert on public.admin_logs;
create policy admin_logs_insert on public.admin_logs
for insert to authenticated
with check (company_id = 'twiga-agm');
