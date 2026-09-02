-- Split delivery: one order, one payment, several destinations.
--
-- Corporate orders routinely go to multiple offices. Rather than forcing the
-- customer to place separate orders, each cart line can be assigned a saved
-- address; at checkout those assignments collapse into order_shipments, one
-- row per destination, each carrying its own shipping charge and tracking.
--
-- Entirely additive: existing orders keep orders.shipping_address and get no
-- shipment rows, and order_items.shipment_id stays null for them.

begin;

create table if not exists public.order_shipments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  label           text,
  -- Snapshot, not a reference to public.addresses: editing a saved address
  -- later must never rewrite where a past order was actually sent.
  address         jsonb not null,
  subtotal        numeric(10, 2) not null default 0,
  -- Charged per destination; the free-shipping threshold is evaluated against
  -- this destination's subtotal, not the order total.
  shipping_total  numeric(10, 2) not null default 0,
  delivery_status public.delivery_status not null default 'pending',
  courier_name    text,
  tracking_number text,
  tracking_url    text,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists order_shipments_order_id_idx
  on public.order_shipments (order_id);

-- Null for single-destination orders and every order predating this feature.
-- set null (not cascade): losing a shipment row must not delete the sold line
-- item, which is financial record.
alter table public.order_items
  add column if not exists shipment_id uuid references public.order_shipments (id) on delete set null;

create index if not exists order_items_shipment_id_idx
  on public.order_items (shipment_id);

-- Which destination a cart line is bound for, held across page loads so the
-- assignment survives navigating away from checkout.
--
-- set null: deleting a saved address degrades the line back to the order's
-- primary destination instead of silently emptying the customer's cart.
alter table public.cart_items
  add column if not exists address_id uuid references public.addresses (id) on delete set null;

create index if not exists cart_items_address_id_idx
  on public.cart_items (address_id);

commit;
