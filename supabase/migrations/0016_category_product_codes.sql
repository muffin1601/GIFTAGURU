-- Category-owned, permanent product codes. Existing default-variant SKUs are
-- copied as legacy codes; the backfill script fills any remaining null values.
alter table public.categories add column if not exists code_prefix text;

with candidate as (
  select id, left(upper(regexp_replace(name, '[^A-Za-z0-9]', '', 'g')) || 'CAT', 3) as base
  from public.categories
), numbered as (
  select id, base, row_number() over (partition by base order by id) as occurrence
  from candidate
)
update public.categories c
set code_prefix = case when occurrence = 1 then base else left(base, 4) || occurrence::text end
from numbered n
where c.id = n.id and c.code_prefix is null;

create unique index if not exists categories_code_prefix_key
  on public.categories (code_prefix) where code_prefix is not null;

alter table public.products add column if not exists product_code text;
update public.products p
set product_code = v.sku
from public.product_variants v
where v.product_id = p.id and v.is_default = true and p.product_code is null;
create unique index if not exists products_product_code_key
  on public.products (product_code) where product_code is not null;

create table if not exists public.product_code_sequences (
  prefix text primary key,
  next_number integer not null check (next_number > 0),
  updated_at timestamptz not null default now()
);

-- Start counters above any existing code already using the category format.
insert into public.product_code_sequences (prefix, next_number)
select c.code_prefix, coalesce(max(split_part(p.product_code, '-', 2)::integer) + 1, 1)
from public.categories c
left join public.products p
  on p.category_id = c.id
 and p.product_code ~ ('^' || c.code_prefix || '-[0-9]+$')
where c.code_prefix is not null
group by c.code_prefix
on conflict (prefix) do update
set next_number = greatest(public.product_code_sequences.next_number, excluded.next_number),
    updated_at = now();

alter table public.order_items add column if not exists product_code text;
update public.order_items oi set product_code = p.product_code
from public.products p where oi.product_id = p.id and oi.product_code is null;
