-- Homepage hero banners, managed from /admin/banners instead of being
-- hard-coded in components/home/CorporateHeroSlider.tsx.
--
-- Images uploaded from the admin panel are stored in the existing
-- `product-images` storage bucket under the `home-banners/` prefix, so no new
-- bucket has to be provisioned. The seeded rows point at the banner files
-- already bundled in /public/BANNERS, so the homepage looks identical
-- immediately after this migration runs.

create table if not exists public.home_banners (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_url text not null,
  link_url text not null default '/',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_banners_sort_order_idx on public.home_banners (sort_order);

drop trigger if exists home_banners_set_updated_at on public.home_banners;
create trigger home_banners_set_updated_at
  before update on public.home_banners
  for each row execute function public.set_updated_at();

alter table public.home_banners enable row level security;

drop policy if exists "Public can read published home banners" on public.home_banners;
create policy "Public can read published home banners" on public.home_banners
  for select using (is_published = true);

drop policy if exists "Admins manage home banners" on public.home_banners;
create policy "Admins manage home banners" on public.home_banners
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed the four banners that were hard-coded, only on an empty table so a
-- re-run never duplicates or overwrites admin edits.
insert into public.home_banners (label, image_url, link_url, sort_order)
select v.label, v.image_url, v.link_url, v.sort_order
from (values
  ('Joining gifts',      '/BANNERS/JOINING.png', '/categories/joining-gifts', 0),
  ('Premium gifts',      '/BANNERS/PREMIUM.png', '/categories/premium-gifts', 1),
  ('Luxury gifts',       '/BANNERS/LUXURY.png',  '/categories/luxury-gifts',  2),
  ('Eco-friendly gifts', '/BANNERS/ECO.png',     '/categories/eco-gifts',     3)
) as v (label, image_url, link_url, sort_order)
where not exists (select 1 from public.home_banners);
