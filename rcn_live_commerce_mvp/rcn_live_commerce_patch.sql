-- Redemption City Navigator: Live Commerce / Vendor / Chat / Delivery Patch
-- Safe to run. It creates missing tables, adds missing columns, and grants API permissions.
-- It does not delete existing data.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vendor_stores') then
    create table public.vendor_stores (
      id uuid primary key default gen_random_uuid(),
      vendor_id text unique,
      owner_name text,
      phone text,
      store_name text not null,
      category text default 'General',
      area text default 'Redemption City',
      address text,
      latitude double precision,
      longitude double precision,
      status text default 'pending',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  end if;
end $$;

alter table public.vendor_stores
add column if not exists vendor_id text,
add column if not exists owner_name text,
add column if not exists phone text,
add column if not exists store_name text,
add column if not exists category text default 'General',
add column if not exists area text default 'Redemption City',
add column if not exists address text,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists status text default 'pending',
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

-- Make sure existing marketplace tables have the app's expected columns.
alter table public.vendors
add column if not exists name text,
add column if not exists category text default 'general',
add column if not exists category_label text default 'Vendor',
add column if not exists area text,
add column if not exists address text,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists phone text,
add column if not exists whatsapp text,
add column if not exists rating numeric default 4.5,
add column if not exists is_open boolean default true,
add column if not exists image_url text,
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

alter table public.vendor_products
add column if not exists vendor_id text,
add column if not exists name text,
add column if not exists description text,
add column if not exists price numeric,
add column if not exists unit text,
add column if not exists image_url text,
add column if not exists in_stock boolean default true,
add column if not exists created_at timestamptz default now();

create table if not exists public.chat_threads (
  id text primary key,
  vendor_id text,
  vendor_name text,
  customer_name text,
  product_id text,
  product_name text,
  last_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  thread_id text,
  vendor_id text,
  vendor_name text,
  customer_name text,
  product_id text,
  product_name text,
  sender_role text,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.market_orders (
  id text primary key,
  vendor_id text,
  vendor_name text,
  product_id text,
  product_name text,
  customer_name text,
  quantity integer default 1,
  amount text,
  delivery_area text,
  delivery_note text,
  delivery_pin text,
  status text default 'paid',
  payment_status text default 'held',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.delivery_people (
  id text primary key,
  full_name text,
  phone text,
  current_area text,
  vehicle_type text,
  status text default 'available',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.delivery_jobs (
  id text primary key,
  order_id text,
  vendor_id text,
  vendor_name text,
  customer_name text,
  pickup_area text,
  dropoff_area text,
  rider_name text,
  rider_phone text,
  delivery_pin text,
  status text default 'pending',
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Starter delivery jobs for demo if no jobs exist yet.
insert into public.delivery_jobs (
  id, order_id, vendor_name, customer_name, pickup_area, dropoff_area, delivery_pin, status
)
select 'job-demo-1', 'RCN-900122', 'CRM Kitchen', 'Sis. Amaka', 'CRM Kitchen / Macedonia Road', 'Haggai Estate Gate', '4821', 'available'
where not exists (select 1 from public.delivery_jobs where id = 'job-demo-1');

insert into public.delivery_jobs (
  id, order_id, vendor_name, customer_name, pickup_area, dropoff_area, delivery_pin, status
)
select 'job-demo-2', 'RCN-900125', 'Comfort Supermarket', 'Bro. Tobi', 'Comfort Palace / CRM Supermarket', 'ICT Plaza Area', '7394', 'available'
where not exists (select 1 from public.delivery_jobs where id = 'job-demo-2');

-- RLS + permissions for Expo public anon key.
alter table public.vendor_stores enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_products enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.market_orders enable row level security;
alter table public.delivery_people enable row level security;
alter table public.delivery_jobs enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.vendor_stores to anon, authenticated;
grant select, insert, update on table public.vendors to anon, authenticated;
grant select, insert, update on table public.vendor_products to anon, authenticated;
grant select, insert, update on table public.chat_threads to anon, authenticated;
grant select, insert, update on table public.chat_messages to anon, authenticated;
grant select, insert, update on table public.market_orders to anon, authenticated;
grant select, insert, update on table public.delivery_people to anon, authenticated;
grant select, insert, update on table public.delivery_jobs to anon, authenticated;

-- Policies. These are open for hackathon demo. Tighten before production.
drop policy if exists "Public read vendor stores" on public.vendor_stores;
create policy "Public read vendor stores" on public.vendor_stores for select to anon, authenticated using (true);
drop policy if exists "Public write vendor stores" on public.vendor_stores;
create policy "Public write vendor stores" on public.vendor_stores for insert to anon, authenticated with check (true);
drop policy if exists "Public update vendor stores" on public.vendor_stores;
create policy "Public update vendor stores" on public.vendor_stores for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public write vendors" on public.vendors;
create policy "Public write vendors" on public.vendors for insert to anon, authenticated with check (true);
drop policy if exists "Public update vendors" on public.vendors;
create policy "Public update vendors" on public.vendors for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public write vendor products" on public.vendor_products;
create policy "Public write vendor products" on public.vendor_products for insert to anon, authenticated with check (true);
drop policy if exists "Public update vendor products" on public.vendor_products;
create policy "Public update vendor products" on public.vendor_products for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public read chat threads" on public.chat_threads;
create policy "Public read chat threads" on public.chat_threads for select to anon, authenticated using (true);
drop policy if exists "Public write chat threads" on public.chat_threads;
create policy "Public write chat threads" on public.chat_threads for insert to anon, authenticated with check (true);
drop policy if exists "Public update chat threads" on public.chat_threads;
create policy "Public update chat threads" on public.chat_threads for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public read chat messages" on public.chat_messages;
create policy "Public read chat messages" on public.chat_messages for select to anon, authenticated using (true);
drop policy if exists "Public write chat messages" on public.chat_messages;
create policy "Public write chat messages" on public.chat_messages for insert to anon, authenticated with check (true);

drop policy if exists "Public read market orders" on public.market_orders;
create policy "Public read market orders" on public.market_orders for select to anon, authenticated using (true);
drop policy if exists "Public write market orders" on public.market_orders;
create policy "Public write market orders" on public.market_orders for insert to anon, authenticated with check (true);
drop policy if exists "Public update market orders" on public.market_orders;
create policy "Public update market orders" on public.market_orders for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public read delivery people" on public.delivery_people;
create policy "Public read delivery people" on public.delivery_people for select to anon, authenticated using (true);
drop policy if exists "Public write delivery people" on public.delivery_people;
create policy "Public write delivery people" on public.delivery_people for insert to anon, authenticated with check (true);
drop policy if exists "Public update delivery people" on public.delivery_people;
create policy "Public update delivery people" on public.delivery_people for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public read delivery jobs" on public.delivery_jobs;
create policy "Public read delivery jobs" on public.delivery_jobs for select to anon, authenticated using (true);
drop policy if exists "Public write delivery jobs" on public.delivery_jobs;
create policy "Public write delivery jobs" on public.delivery_jobs for insert to anon, authenticated with check (true);
drop policy if exists "Public update delivery jobs" on public.delivery_jobs;
create policy "Public update delivery jobs" on public.delivery_jobs for update to anon, authenticated using (true) with check (true);
