alter type public.user_role add value if not exists 'super_admin';

alter type public.order_status add value if not exists 'confirmed';
alter type public.order_status add value if not exists 'ready_to_ship';
alter type public.order_status add value if not exists 'shipped';
alter type public.order_status add value if not exists 'out_for_delivery';
alter type public.order_status add value if not exists 'delivered';

alter type public.quote_status add value if not exists 'negotiating';
alter type public.quote_status add value if not exists 'converted';
alter type public.quote_status add value if not exists 'closed';

do $$ begin
  create type public.delivery_status as enum (
    'pending',
    'ready_to_ship',
    'shipped',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.inventory_adjustment_type as enum (
    'manual',
    'order_reserved',
    'order_released',
    'order_fulfilled',
    'return_received'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.email_event_status as enum ('pending', 'sent', 'skipped', 'failed');
exception
  when duplicate_object then null;
end $$;

alter table public.orders
  add column if not exists delivery_status public.delivery_status not null default 'pending',
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz,
  add column if not exists estimated_delivery_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists delivery_notes text;

alter table public.payments
  add column if not exists webhook_event_id text;

create unique index if not exists payments_webhook_event_id_key
  on public.payments (webhook_event_id)
  where webhook_event_id is not null;

alter table public.discounts
  add column if not exists per_user_limit integer;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  from_payment_status public.payment_status,
  to_payment_status public.payment_status,
  from_delivery_status public.delivery_status,
  to_delivery_status public.delivery_status,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);
create index if not exists order_status_history_actor_id_idx on public.order_status_history(actor_id);

create table if not exists public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  type public.inventory_adjustment_type not null,
  quantity_change integer not null,
  quantity_after integer not null,
  reason text,
  reference text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_adjustments_inventory_id_idx on public.inventory_adjustments(inventory_id);
create index if not exists inventory_adjustments_variant_id_idx on public.inventory_adjustments(variant_id);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  type text not null,
  recipient text not null,
  subject text not null,
  status public.email_event_status not null default 'pending',
  order_id uuid references public.orders(id) on delete cascade,
  error_message text,
  provider_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists email_events_order_id_idx on public.email_events(order_id);
create index if not exists email_events_status_idx on public.email_events(status);

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  label text,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (key, value, label)
values
  ('store_name', '"Gifta Guru"'::jsonb, 'Store name'),
  ('contact_phone', '"87507 08222"'::jsonb, 'Contact phone'),
  ('whatsapp_number', '"918750708222"'::jsonb, 'WhatsApp number'),
  ('support_email', '"mfglobalservices18@gmail.com"'::jsonb, 'Support email'),
  ('minimum_quantity', '5'::jsonb, 'Minimum order quantity'),
  ('gift_wrap_price', '40'::jsonb, 'Gift wrap price'),
  ('shipping_message', '"Delivery available across India"'::jsonb, 'Shipping message'),
  ('shipping_timeline', '"Ships within 10-15 days"'::jsonb, 'Shipping timeline')
on conflict (key) do nothing;

alter table public.order_status_history enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.email_events enable row level security;
alter table public.store_settings enable row level security;

create policy "order_status_history_admin_all" on public.order_status_history
  for all using (public.is_admin()) with check (public.is_admin());
create policy "inventory_adjustments_admin_all" on public.inventory_adjustments
  for all using (public.is_admin()) with check (public.is_admin());
create policy "email_events_admin_all" on public.email_events
  for all using (public.is_admin()) with check (public.is_admin());
create policy "store_settings_public_read" on public.store_settings
  for select using (true);
create policy "store_settings_admin_all" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());
