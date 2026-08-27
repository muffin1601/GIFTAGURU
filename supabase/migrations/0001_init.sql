-- Gifta Guru production schema
-- Run via Supabase CLI: supabase db push
-- or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ==========================================================================
-- ENUMS
-- ==========================================================================

create type public.user_role as enum ('customer', 'admin');
create type public.product_status as enum ('draft', 'active', 'archived');
create type public.cart_status as enum ('active', 'merged', 'converted', 'abandoned');
create type public.order_status as enum ('pending', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_record_status as enum ('created', 'authorized', 'captured', 'failed', 'refunded');
create type public.customization_request_status as enum ('pending', 'in_review', 'approved', 'rejected', 'completed');
create type public.customization_type as enum ('logo_upload', 'personalization_text', 'gift_message', 'gift_wrap');
create type public.discount_type as enum ('percentage', 'fixed');
create type public.quote_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');

-- ==========================================================================
-- HELPER: updated_at trigger
-- ==========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ==========================================================================
-- PROFILES
-- ==========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  company_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ==========================================================================
-- ADDRESSES
-- ==========================================================================

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text default 'home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_profile_id_idx on public.addresses (profile_id);

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- CATEGORIES / COLLECTIONS / PRODUCTS
-- ==========================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  image_url text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  base_price numeric(10, 2) not null check (base_price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  is_customizable boolean not null default false,
  min_order_quantity int not null default 1 check (min_order_quantity > 0),
  occasion_tags text[] not null default '{}',
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  avg_rating numeric(2, 1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_occasion_tags_idx on public.products using gin (occasion_tags);
create index products_search_idx on public.products
  using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  sku text not null unique,
  option1_name text,
  option1_value text,
  option2_name text,
  option2_value text,
  price_override numeric(10, 2) check (price_override is null or price_override >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants (product_id);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.product_collection_mappings (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  primary key (product_id, collection_id)
);

create index product_collection_mappings_collection_id_idx
  on public.product_collection_mappings (collection_id);

create table public.product_customizations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  customization_type public.customization_type not null,
  label text not null,
  is_required boolean not null default false,
  extra_price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index product_customizations_product_id_idx on public.product_customizations (product_id);

-- ==========================================================================
-- INVENTORY
-- ==========================================================================

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.product_variants (id) on delete cascade,
  quantity_available int not null default 0 check (quantity_available >= 0),
  quantity_reserved int not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now()
);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- CARTS
-- ==========================================================================

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  status public.cart_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index carts_user_id_idx on public.carts (user_id);

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity int not null check (quantity > 0),
  customization jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- WISHLISTS
-- ==========================================================================

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);

-- ==========================================================================
-- ORDERS
-- ==========================================================================

create sequence public.order_number_seq start 100001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('GG-' || nextval('public.order_number_seq')::text),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount_total numeric(10, 2) not null default 0,
  shipping_total numeric(10, 2) not null default 0,
  tax_total numeric(10, 2) not null default 0,
  total numeric(10, 2) not null check (total >= 0),
  currency text not null default 'INR',
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  notes text,
  gift_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_order_number_idx on public.orders (order_number);
create index orders_status_idx on public.orders (status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_name text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  customization jsonb not null default '{}'::jsonb,
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ==========================================================================
-- PAYMENTS
-- ==========================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status public.payment_record_status not null default 'created',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- CUSTOMIZATION REQUESTS / GIFT MESSAGES
-- ==========================================================================

create table public.customization_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  company_name text,
  logo_url text,
  instructions text,
  quantity int not null default 1 check (quantity > 0),
  status public.customization_request_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customization_requests_user_id_idx on public.customization_requests (user_id);

create trigger customization_requests_set_updated_at
  before update on public.customization_requests
  for each row execute function public.set_updated_at();

create table public.gift_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete cascade,
  recipient_name text,
  sender_name text,
  message text not null,
  created_at timestamptz not null default now()
);

create index gift_messages_order_id_idx on public.gift_messages (order_id);

-- ==========================================================================
-- DISCOUNTS
-- ==========================================================================

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  type public.discount_type not null,
  value numeric(10, 2) not null check (value > 0),
  min_order_value numeric(10, 2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger discounts_set_updated_at
  before update on public.discounts
  for each row execute function public.set_updated_at();

create table public.discount_usage (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  amount_discounted numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  unique (discount_id, order_id)
);

-- ==========================================================================
-- BULK QUOTES / NEWSLETTER / REVIEWS
-- ==========================================================================

create table public.bulk_quote_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  company_name text,
  product_interest text,
  quantity int,
  budget_range text,
  occasion text,
  message text,
  status public.quote_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bulk_quote_requests_status_idx on public.bulk_quote_requests (status);

create trigger bulk_quote_requests_set_updated_at
  before update on public.bulk_quote_requests
  for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- ROW LEVEL SECURITY
-- ==========================================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_collection_mappings enable row level security;
alter table public.product_customizations enable row level security;
alter table public.inventory enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.customization_requests enable row level security;
alter table public.gift_messages enable row level security;
alter table public.discounts enable row level security;
alter table public.discount_usage enable row level security;
alter table public.bulk_quote_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.reviews enable row level security;

-- profiles: read/update own row; admin reads all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- addresses: owner CRUD, admin read-all
create policy "addresses_owner_select" on public.addresses
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "addresses_owner_insert" on public.addresses
  for insert with check (profile_id = auth.uid());
create policy "addresses_owner_update" on public.addresses
  for update using (profile_id = auth.uid());
create policy "addresses_owner_delete" on public.addresses
  for delete using (profile_id = auth.uid());

-- catalog tables: public read, admin write
create policy "categories_public_select" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "collections_public_select" on public.collections for select using (true);
create policy "collections_admin_write" on public.collections
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_select" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_variants_public_select" on public.product_variants for select using (true);
create policy "product_variants_admin_write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_select" on public.product_images for select using (true);
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_collection_mappings_public_select" on public.product_collection_mappings
  for select using (true);
create policy "product_collection_mappings_admin_write" on public.product_collection_mappings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_customizations_public_select" on public.product_customizations
  for select using (true);
create policy "product_customizations_admin_write" on public.product_customizations
  for all using (public.is_admin()) with check (public.is_admin());

-- inventory: public read (stock status), admin write
create policy "inventory_public_select" on public.inventory for select using (true);
create policy "inventory_admin_write" on public.inventory
  for all using (public.is_admin()) with check (public.is_admin());

-- carts / cart_items: owner only. Guest (user_id is null) carts have no
-- auth.uid() to scope to, so they are intentionally NOT reachable through
-- anon/authenticated RLS policies here - guest cart reads/writes go through
-- server actions using the service-role client, gated by an unguessable,
-- httpOnly cart-id cookie the server itself sets. See lib/actions/cart.ts.
create policy "carts_owner_select" on public.carts
  for select using (user_id = auth.uid());
create policy "carts_owner_insert" on public.carts
  for insert with check (user_id = auth.uid());
create policy "carts_owner_update" on public.carts
  for update using (user_id = auth.uid());

create policy "cart_items_owner_select" on public.cart_items
  for select using (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));
create policy "cart_items_owner_write" on public.cart_items
  for all using (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  ));

-- wishlists
create policy "wishlists_owner_all" on public.wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlist_items_owner_all" on public.wishlist_items
  for all using (exists (
    select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()
  ));

-- orders / order_items / payments: read own, admin all. No public/customer
-- INSERT or UPDATE policy - order creation and payment updates only happen
-- server-side via the service-role client after trusted price calculation
-- and (for payments) signature-verified Razorpay webhooks.
create policy "orders_owner_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_owner_select" on public.order_items
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));
create policy "order_items_admin_write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments_owner_select" on public.payments
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));
create policy "payments_admin_write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- customization requests: owner + admin
create policy "customization_requests_owner_select" on public.customization_requests
  for select using (user_id = auth.uid() or public.is_admin());
create policy "customization_requests_owner_insert" on public.customization_requests
  for insert with check (user_id = auth.uid());
create policy "customization_requests_admin_write" on public.customization_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- gift messages: tied to order ownership, otherwise server-managed
create policy "gift_messages_owner_select" on public.gift_messages
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));
create policy "gift_messages_admin_write" on public.gift_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- discounts: public can read active codes to validate at checkout
create policy "discounts_public_select" on public.discounts
  for select using (is_active = true);
create policy "discounts_admin_write" on public.discounts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "discount_usage_admin_only" on public.discount_usage
  for all using (public.is_admin()) with check (public.is_admin());

-- bulk quotes: public write-only form, admin manages
create policy "bulk_quote_requests_public_insert" on public.bulk_quote_requests
  for insert with check (true);
create policy "bulk_quote_requests_admin_all" on public.bulk_quote_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- newsletter: public write-only, admin manages
create policy "newsletter_subscribers_public_insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter_subscribers_admin_all" on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews: public reads approved reviews, authenticated users write their own
create policy "reviews_public_select" on public.reviews
  for select using (is_approved = true or user_id = auth.uid() or public.is_admin());
create policy "reviews_owner_insert" on public.reviews
  for insert with check (user_id = auth.uid());
create policy "reviews_owner_update" on public.reviews
  for update using (user_id = auth.uid());
create policy "reviews_admin_write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
