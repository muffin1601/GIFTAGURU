-- Five units is the site-wide minimum. Existing orders are intentionally not
-- touched: this only normalizes catalogue and store-setting records used for
-- future carts and checkout.
update public.products
set min_order_quantity = 5
where min_order_quantity < 5;

update public.store_settings
set value = '5'::jsonb
where key = 'minimum_quantity';

alter table public.products
  alter column min_order_quantity set default 5;

alter table public.products
  drop constraint if exists products_min_order_quantity_at_least_five;

alter table public.products
  add constraint products_min_order_quantity_at_least_five
  check (min_order_quantity >= 5);
