-- Product-level MOQ is a business decision. The former >= 5 check contradicted
-- the admin form and prevented single-unit or small-quantity products.
alter table public.products
  drop constraint if exists products_min_order_quantity_at_least_five;

alter table public.products
  alter column min_order_quantity set default 1;

alter table public.products
  add constraint products_min_order_quantity_at_least_one
  check (min_order_quantity >= 1);
