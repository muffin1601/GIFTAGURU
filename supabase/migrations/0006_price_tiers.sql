-- Quantity-based pricing tiers per product.
-- A cart/order line's unit price is the price of the highest tier whose
-- min_quantity is <= the ordered quantity; falls back to products.base_price.
create table if not exists public.product_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null check (min_quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, min_quantity)
);

create index if not exists product_price_tiers_product_id_idx on public.product_price_tiers (product_id);

alter table public.product_price_tiers enable row level security;

create policy "Public can read price tiers" on public.product_price_tiers
  for select using (true);

create policy "Service role manages price tiers" on public.product_price_tiers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
