-- Twiga AGM schema for project: qiepkvtewhqnhybskxba
-- Generated to match current web/admin Supabase usage.

create extension if not exists pgcrypto;

-- =====================================
-- Core tables
-- =====================================

create table if not exists public.properties (
  id text primary key,
  company_id text not null default 'twiga-agm',
  slug text not null unique,
  name text not null,
  type text not null default 'boutique',
  location jsonb not null default '{"address":"","city":"Zanzibar","country":"Tanzania"}'::jsonb,
  description text,
  shortDescription text,
  short_description text,
  totalRooms integer,
  total_rooms integer,
  priceFrom bigint,
  price_from bigint,
  created_at bigint,
  updated_at bigint
);

create table if not exists public.rooms (
  company_id text not null default 'twiga-agm',
  property_slug text not null default 'twiga-residence',
  property_id text not null default 'twiga-residence',
  id text not null,
  name text not null,
  type text not null default 'standard',
  maxGuests integer,
  max_guests integer,
  basePrice bigint,
  base_price bigint,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  description text,
  bedroomCount integer,
  bedroom_count integer,
  bathroomCount integer,
  bathroom_count integer,
  created_at bigint,
  updated_at bigint,
  primary key (company_id, property_slug, id)
);

create table if not exists public.bookings (
  id text primary key,
  company_id text not null default 'twiga-agm',
  property_id text not null default 'twiga-residence',
  property_slug text not null default 'twiga-residence',

  -- camelCase fields written by web payment service
  propertyId text,
  guestName text,
  guestEmail text,
  guestPhone text,
  roomId text,
  checkIn bigint,
  checkOut bigint,
  numberOfGuests integer,
  totalNights integer,
  roomPrice bigint,
  totalPrice bigint,
  paymentId text,
  specialRequests text,
  createdAt bigint,
  updatedAt bigint,

  -- snake_case fields updated by admin flows
  guest_name text,
  guest_email text,
  guest_phone text,
  room_id text,
  check_in bigint,
  check_out bigint,
  number_of_guests integer,
  total_nights integer,
  room_price bigint,
  total_price bigint,
  payment_id text,
  special_requests text,
  created_at bigint,
  updated_at bigint,

  source text not null default 'direct',
  status text not null default 'pending_payment',
  cancel_reason text,
  cancelled_at bigint,
  check_in_completed boolean,
  check_in_completed_at bigint
);

create table if not exists public.payments (
  id text primary key,
  booking_id text,
  bookingId text,
  company_id text not null default 'twiga-agm',
  property_id text not null default 'twiga-residence',
  property_slug text not null default 'twiga-residence',
  propertyId text,

  amount bigint not null default 0,
  currency text not null default 'TZS',
  method text not null default 'mobile_money',

  flutterwaveRef text,
  flutterwave_ref text,
  idempotencyKey text,
  idempotency_key text,

  status text not null default 'initiated',

  mobileProvider text,
  mobile_provider text,
  phoneNumber text,
  phone_number text,

  stkPushAttempts integer,
  stk_push_attempts integer,
  webhookReceived boolean,
  webhook_received boolean,
  webhookAt bigint,
  webhook_at bigint,

  createdAt bigint,
  created_at bigint,
  updatedAt bigint,
  updated_at bigint,
  confirmedAt bigint,
  confirmed_at bigint,

  failureReason text,
  failure_reason text,

  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  company_id text not null default 'twiga-agm',
  property_id text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  actor jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  company_id text not null default 'twiga-agm',
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  source text not null default 'web',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- =====================================
-- Indexes
-- =====================================

create index if not exists idx_properties_company on public.properties (company_id);
create index if not exists idx_properties_slug on public.properties (slug);

create index if not exists idx_rooms_company_property on public.rooms (company_id, property_slug);
create index if not exists idx_rooms_property_id on public.rooms (property_id);
create index if not exists idx_rooms_id on public.rooms (id);

create index if not exists idx_bookings_company_property on public.bookings (company_id, property_id, property_slug);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_created_at on public.bookings (createdAt desc);

create index if not exists idx_payments_company_property on public.payments (company_id, property_id, property_slug);
create index if not exists idx_payments_booking on public.payments (booking_id, bookingId);
create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_payments_created_at on public.payments (createdAt desc);

create index if not exists idx_admin_logs_company_created on public.admin_logs (company_id, created_at desc);
create index if not exists idx_contact_inquiries_company_created on public.contact_inquiries (company_id, created_at desc);

-- =====================================
-- RLS
-- =====================================

alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.admin_logs enable row level security;
alter table public.contact_inquiries enable row level security;

-- Properties

drop policy if exists properties_select on public.properties;
create policy properties_select on public.properties
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists properties_insert on public.properties;
create policy properties_insert on public.properties
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists properties_update on public.properties;
create policy properties_update on public.properties
for update to anon, authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Rooms

drop policy if exists rooms_select on public.rooms;
create policy rooms_select on public.rooms
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms
for update to anon, authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Bookings

drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
for update to anon, authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Payments

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

drop policy if exists payments_update on public.payments;
create policy payments_update on public.payments
for update to anon, authenticated
using (company_id = 'twiga-agm')
with check (company_id = 'twiga-agm');

-- Admin logs

drop policy if exists admin_logs_select on public.admin_logs;
create policy admin_logs_select on public.admin_logs
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists admin_logs_insert on public.admin_logs;
create policy admin_logs_insert on public.admin_logs
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

-- Contact inquiries

drop policy if exists contact_inquiries_select on public.contact_inquiries;
create policy contact_inquiries_select on public.contact_inquiries
for select to anon, authenticated
using (company_id = 'twiga-agm');

drop policy if exists contact_inquiries_insert on public.contact_inquiries;
create policy contact_inquiries_insert on public.contact_inquiries
for insert to anon, authenticated
with check (company_id = 'twiga-agm');

-- =====================================
-- Seed (idempotent)
-- =====================================

insert into public.properties (
  id, company_id, slug, name, type, location, description, shortDescription, short_description,
  totalRooms, total_rooms, priceFrom, price_from, created_at, updated_at
)
values (
  'twiga-residence',
  'twiga-agm',
  'twiga-residence',
  'Twiga Residence',
  'boutique',
  '{"address":"Zanzibar","city":"Zanzibar","country":"Tanzania"}'::jsonb,
  'Twiga Residence is a premium boutique property offering 8 beautifully appointed standard rooms and 1 cozy apartment with a kitchen and private balcony.',
  '8 standard rooms and 1 cozy apartment with kitchen and private balcony.',
  '8 standard rooms and 1 cozy apartment with kitchen and private balcony.',
  9,
  9,
  150000,
  150000,
  (extract(epoch from now()) * 1000)::bigint,
  (extract(epoch from now()) * 1000)::bigint
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  type = excluded.type,
  location = excluded.location,
  description = excluded.description,
  shortDescription = excluded.shortDescription,
  short_description = excluded.short_description,
  totalRooms = excluded.totalRooms,
  total_rooms = excluded.total_rooms,
  priceFrom = excluded.priceFrom,
  price_from = excluded.price_from,
  updated_at = excluded.updated_at;

insert into public.rooms (
  company_id, property_slug, property_id, id, name, type,
  maxGuests, max_guests, basePrice, base_price, amenities, images,
  description, bedroomCount, bedroom_count, bathroomCount, bathroom_count,
  created_at, updated_at
)
values
  ('twiga-agm','twiga-residence','twiga-residence','room-1','Standard Room 1','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-2','Standard Room 2','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-3','Standard Room 3','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-4','Standard Room 4','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-5','Standard Room 5','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-6','Standard Room 6','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-7','Standard Room 7','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','room-8','Standard Room 8','standard',2,2,15000000,15000000,array['WiFi','AC','Flat screen TV'],array['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'],'Comfortable standard room with modern amenities and AC.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint),
  ('twiga-agm','twiga-residence','twiga-residence','apartment-1','Cozy Apartment','apartment',4,4,30000000,30000000,array['WiFi','AC','Kitchen','Balcony','Flat screen TV'],array['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],'Cozy apartment with kitchen and private balcony.',1,1,1,1,(extract(epoch from now()) * 1000)::bigint,(extract(epoch from now()) * 1000)::bigint)
on conflict (company_id, property_slug, id) do update set
  name = excluded.name,
  type = excluded.type,
  maxGuests = excluded.maxGuests,
  max_guests = excluded.max_guests,
  basePrice = excluded.basePrice,
  base_price = excluded.base_price,
  amenities = excluded.amenities,
  images = excluded.images,
  description = excluded.description,
  bedroomCount = excluded.bedroomCount,
  bedroom_count = excluded.bedroom_count,
  bathroomCount = excluded.bathroomCount,
  bathroom_count = excluded.bathroom_count,
  updated_at = excluded.updated_at;
