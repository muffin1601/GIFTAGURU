-- Three Diwali hamper products sourced from public/Hampers. Each folder is a
-- single product with several gallery images, rather than several products.

insert into public.products
  (slug, name, product_code, description, category_id, base_price, compare_at_price,
   is_customizable, min_order_quantity, occasion_tags, status, is_featured)
select
  source.slug,
  source.name,
  source.product_code,
  source.description,
  category.id,
  source.base_price,
  source.compare_at_price,
  true,
  source.min_order_quantity,
  array['corporate-gifts', 'festive-corporate-gifts', 'gift-sets-hampers'],
  'active',
  true
from (
  values
    ('diwali-signature-hamper', 'Diwali Signature Hamper', 'GG-HAMP-01', 'A curated corporate Diwali hamper presented for employee, client, and partner gifting.', 'premium-gift-sets', 1999.00, 2359.00, 20),
    ('diwali-celebration-hamper', 'Diwali Celebration Hamper', 'GG-HAMP-02', 'A festive corporate hamper with a polished presentation for Diwali gifting programmes.', 'premium-gift-sets', 2999.00, 3539.00, 15),
    ('diwali-grand-hamper', 'Diwali Grand Hamper', 'GG-HAMP-03', 'A premium Diwali hamper for important clients, leadership teams, and special festive moments.', 'luxury-gift-sets', 3999.00, 4719.00, 10)
) as source(slug, name, product_code, description, category_slug, base_price, compare_at_price, min_order_quantity)
join public.categories category on category.slug = source.category_slug
on conflict (slug) do update set
  name = excluded.name,
  product_code = excluded.product_code,
  description = excluded.description,
  category_id = excluded.category_id,
  base_price = excluded.base_price,
  compare_at_price = excluded.compare_at_price,
  min_order_quantity = excluded.min_order_quantity,
  occasion_tags = excluded.occasion_tags,
  status = excluded.status,
  is_featured = excluded.is_featured;

insert into public.product_variants (product_id, name, sku, is_default)
select product.id, 'Standard', source.sku, true
from (values
  ('diwali-signature-hamper', 'GG-HAMP-01-STD'),
  ('diwali-celebration-hamper', 'GG-HAMP-02-STD'),
  ('diwali-grand-hamper', 'GG-HAMP-03-STD')
) as source(slug, sku)
join public.products product on product.slug = source.slug
on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, is_default = excluded.is_default;

insert into public.inventory (variant_id, quantity_available, quantity_reserved)
select variant.id, 500, 0
from public.product_variants variant
where variant.sku in ('GG-HAMP-01-STD', 'GG-HAMP-02-STD', 'GG-HAMP-03-STD')
on conflict (variant_id) do update set quantity_available = excluded.quantity_available, quantity_reserved = 0;

insert into public.product_collection_mappings (product_id, collection_id)
select product.id, collection.id
from (values
  ('diwali-signature-hamper', 'corporate-gifts'), ('diwali-signature-hamper', 'premium-gifts'), ('diwali-signature-hamper', 'festive-corporate-gifts'), ('diwali-signature-hamper', 'gift-sets-hampers'),
  ('diwali-celebration-hamper', 'corporate-gifts'), ('diwali-celebration-hamper', 'premium-gifts'), ('diwali-celebration-hamper', 'festive-corporate-gifts'), ('diwali-celebration-hamper', 'gift-sets-hampers'),
  ('diwali-grand-hamper', 'corporate-gifts'), ('diwali-grand-hamper', 'luxury-gifts'), ('diwali-grand-hamper', 'festive-corporate-gifts'), ('diwali-grand-hamper', 'gift-sets-hampers')
) as source(product_slug, collection_slug)
join public.products product on product.slug = source.product_slug
join public.collections collection on collection.slug = source.collection_slug
on conflict do nothing;

insert into public.product_customizations (product_id, customization_type, label, is_required, extra_price)
select product.id, customization.type::public.customization_type, customization.label, false, customization.extra_price
from public.products product
cross join (values
  ('logo_upload', 'Company logo upload', 0.00),
  ('personalization_text', 'Personalization text', 0.00),
  ('gift_message', 'Gift message card', 0.00),
  ('gift_wrap', 'Premium gift wrap', 99.00)
) as customization(type, label, extra_price)
where product.slug in ('diwali-signature-hamper', 'diwali-celebration-hamper', 'diwali-grand-hamper');

insert into public.product_images (product_id, variant_id, url, alt_text, sort_order)
select product.id, variant.id, source.url, source.alt_text, source.sort_order
from (values
  ('diwali-signature-hamper', 'GG-HAMP-01-STD', '/Hampers/set 1/gift_set_1600x1600.webp', 'Diwali Signature Hamper image 1', 0),
  ('diwali-signature-hamper', 'GG-HAMP-01-STD', '/Hampers/set 1/gift_hamper_1600x1600_transparent.webp', 'Diwali Signature Hamper image 2', 1),
  ('diwali-signature-hamper', 'GG-HAMP-01-STD', '/Hampers/set 1/gift_hamper_1600x1600(1).webp', 'Diwali Signature Hamper image 3', 2),
  ('diwali-celebration-hamper', 'GG-HAMP-02-STD', '/Hampers/set 2/diwali_hamper_final_1600x1600.webp', 'Diwali Celebration Hamper image 1', 0),
  ('diwali-celebration-hamper', 'GG-HAMP-02-STD', '/Hampers/set 2/diwali_hamper_1600x1600_transparent.webp', 'Diwali Celebration Hamper image 2', 1),
  ('diwali-celebration-hamper', 'GG-HAMP-02-STD', '/Hampers/set 2/FINAL_1600x1600_TRANSPARENT_GIFT_HAMPER.webp', 'Diwali Celebration Hamper image 3', 2),
  ('diwali-celebration-hamper', 'GG-HAMP-02-STD', '/Hampers/set 2/gift_hamper_1600x1600_final.webp', 'Diwali Celebration Hamper image 4', 3),
  ('diwali-grand-hamper', 'GG-HAMP-03-STD', '/Hampers/set 3/gift_hamper_1600x1600_clean (1).webp', 'Diwali Grand Hamper image 1', 0),
  ('diwali-grand-hamper', 'GG-HAMP-03-STD', '/Hampers/set 3/gift_hamper_1600x1600(2) (1).webp', 'Diwali Grand Hamper image 2', 1),
  ('diwali-grand-hamper', 'GG-HAMP-03-STD', '/Hampers/set 3/Gift_Hamper_1600x1600(3).webp', 'Diwali Grand Hamper image 3', 2)
) as source(product_slug, sku, url, alt_text, sort_order)
join public.products product on product.slug = source.product_slug
join public.product_variants variant on variant.sku = source.sku;
