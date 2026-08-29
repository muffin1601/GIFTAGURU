-- Sample seed data for local development / staging.
-- Safe to re-run: it upserts on the unique slug/sku/code columns.

-- ---------------------------------------------------------------------------
-- Categories (product type)
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, description, sort_order) values
  ('tech-electronics', 'Tech & Electronics', 'Power banks, speakers, gadgets, and tech accessories.', 1),
  ('office-stationery', 'Office & Stationery', 'Diaries, pens, and desk essentials.', 2),
  ('drinkware', 'Drinkware', 'Bottles, mugs, and flasks.', 3),
  ('bags-travel', 'Bags & Travel', 'Backpacks, travel organizers, and pouches.', 4),
  ('lifestyle-wellness', 'Lifestyle & Wellness', 'Wellness and self-care gifting.', 5),
  ('home-living', 'Home & Living', 'Decor and home essentials.', 6),
  ('awards-recognition', 'Awards & Recognition', 'Trophies, plaques, and recognition gifts.', 7),
  ('gourmet-hampers', 'Gourmet & Food Hampers', 'Curated food and beverage hampers.', 8),
  ('apparel-merchandise', 'Apparel & Merchandise', 'Branded apparel and merchandise.', 9),
  ('desk-essentials', 'Desk Essentials', 'Organizers and desk accessories.', 10)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Collections (business / gift-style groupings)
-- ---------------------------------------------------------------------------
insert into public.collections (slug, name, tagline, description, image_url, is_featured, sort_order) values
  ('corporate-gifts', 'Corporate Gifts', 'Gifting for every business relationship', 'General corporate gifting for clients, teams, and partners.', null, true, 1),
  ('bulk-corporate-orders', 'Bulk Corporate Orders', 'Scale gifting without losing quality', 'Volume gifting programs for large teams and events.', null, false, 2),
  -- Not featured: shares Joining Gifts' banner, so it duplicates that card.
  ('employee-welcome-kits', 'Employee Welcome Kits', 'Welcome to New Beginnings.', 'Onboarding kits for new hires.', '/images/joining-gifts.png', false, 3),
  ('joining-gifts', 'Joining Gifts', 'Thoughtfully curated joining kits', 'Joining kits to inspire, engage and empower.', '/images/joining-gifts.png', true, 4),
  ('client-gifts', 'Client Gifts', 'Strengthen client relationships', 'Premium, branded gifts for valued clients.', null, false, 5),
  ('employee-appreciation-gifts', 'Employee Appreciation Gifts', 'Recognize great work', 'Gifting for milestones and performance recognition.', null, false, 6),
  ('executive-gifts', 'Executive Gifts', 'Leadership-grade gifting', 'Exquisite gifts for leadership moments.', '/images/luxury-gifts.png', false, 7),
  ('event-conference-gifts', 'Event & Conference Gifts', 'Make your event memorable', 'Custom gifting for conferences, launches, and offsites.', null, false, 8),
  ('festive-corporate-gifts', 'Festive Corporate Gifts', 'Seasonal gifting, done right', 'Festival and seasonal gifting programs delivered on time.', null, true, 9),
  ('custom-branded-gifts', 'Custom Branded Gifts', 'Make it unmistakably yours', 'Branding, packaging, and personalization across collections.', '/images/luxury-gifts.png', false, 10),
  ('premium-gifts', 'Premium Gifts', 'Thoughtful Gifts. Stronger Relationships.', 'Premium gift kits for every corporate occasion.', '/images/premium-gifts.png', true, 11),
  ('luxury-gifts', 'Luxury Gifts', 'Luxury Gifts. Timeless Impressions.', 'Exquisite gift sets for every occasion.', '/images/luxury-gifts.png', true, 12),
  ('eco-gifts', 'Eco-Friendly Gifts', 'Gifts That Care. For People & Planet.', 'Sustainable gift sets for a responsible tomorrow.', '/images/eco-gifts.png', true, 13),
  ('gift-sets-hampers', 'Gift Sets & Hampers', 'Curated, ready to gift', 'Multi-product hampers curated for every occasion.', null, false, 14)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Products + variants + images + inventory + collection mappings
-- ---------------------------------------------------------------------------
do $$
declare
  cat_office uuid;
  cat_drinkware uuid;
  col_eco uuid;
  col_joining uuid;
  col_luxury uuid;
  col_premium uuid;
  col_corporate uuid;
  col_hampers uuid;
  p_id uuid;
  v_id uuid;
begin
  select id into cat_office from public.categories where slug = 'office-stationery';
  select id into cat_drinkware from public.categories where slug = 'drinkware';
  select id into col_eco from public.collections where slug = 'eco-gifts';
  select id into col_joining from public.collections where slug = 'joining-gifts';
  select id into col_luxury from public.collections where slug = 'luxury-gifts';
  select id into col_premium from public.collections where slug = 'premium-gifts';
  select id into col_corporate from public.collections where slug = 'corporate-gifts';
  select id into col_hampers from public.collections where slug = 'gift-sets-hampers';

  -- Cork Travel Companion Set
  insert into public.products (slug, name, description, category_id, base_price, is_customizable, min_order_quantity, occasion_tags, status, is_featured)
  values ('cork-travel-companion-set', 'Cork Travel Companion Set', 'Notebook, pen, and bottle in sustainably sourced cork.', cat_office, 1499, true, 25, array['onboarding','eco'], 'active', true)
  on conflict (slug) do update set name = excluded.name returning id into p_id;

  insert into public.product_variants (product_id, name, sku, is_default)
  values (p_id, 'Standard', 'ECO-CORK-STD', true)
  on conflict (sku) do update set name = excluded.name returning id into v_id;

  insert into public.inventory (variant_id, quantity_available)
  values (v_id, 500)
  on conflict (variant_id) do update set quantity_available = excluded.quantity_available;

  insert into public.product_images (product_id, url, alt_text, sort_order)
  values (p_id, '/images/eco-gifts.png', 'Cork Travel Companion Set', 0)
  on conflict do nothing;

  insert into public.product_collection_mappings (product_id, collection_id)
  values (p_id, col_eco), (p_id, col_corporate)
  on conflict do nothing;

  -- Welcome Aboard Box
  insert into public.products (slug, name, description, category_id, base_price, is_customizable, min_order_quantity, occasion_tags, status, is_featured)
  values ('welcome-aboard-box', 'Welcome Aboard Box', 'Diary, pen, and steel bottle in a branded welcome box.', cat_office, 1999, true, 20, array['onboarding'], 'active', true)
  on conflict (slug) do update set name = excluded.name returning id into p_id;

  insert into public.product_variants (product_id, name, sku, is_default)
  values (p_id, 'Standard', 'JOIN-WELCOME-STD', true)
  on conflict (sku) do update set name = excluded.name returning id into v_id;

  insert into public.inventory (variant_id, quantity_available)
  values (v_id, 300)
  on conflict (variant_id) do update set quantity_available = excluded.quantity_available;

  insert into public.product_images (product_id, url, alt_text, sort_order)
  values (p_id, '/images/joining-gifts.png', 'Welcome Aboard Box', 0)
  on conflict do nothing;

  insert into public.product_collection_mappings (product_id, collection_id)
  values (p_id, col_joining), (p_id, col_corporate)
  on conflict do nothing;

  -- Signature Leather Gift Set
  insert into public.products (slug, name, description, category_id, base_price, is_customizable, min_order_quantity, occasion_tags, status, is_featured)
  values ('signature-leather-gift-set', 'Signature Leather Gift Set', 'Premium leather diary, pen, and steel flask trio.', cat_drinkware, 3499, true, 10, array['leadership','client'], 'active', true)
  on conflict (slug) do update set name = excluded.name returning id into p_id;

  insert into public.product_variants (product_id, name, sku, is_default)
  values (p_id, 'Standard', 'LUX-LEATHER-STD', true)
  on conflict (sku) do update set name = excluded.name returning id into v_id;

  insert into public.inventory (variant_id, quantity_available)
  values (v_id, 150)
  on conflict (variant_id) do update set quantity_available = excluded.quantity_available;

  insert into public.product_images (product_id, url, alt_text, sort_order)
  values (p_id, '/images/luxury-gifts.png', 'Signature Leather Gift Set', 0)
  on conflict do nothing;

  insert into public.product_collection_mappings (product_id, collection_id)
  values (p_id, col_luxury), (p_id, col_corporate)
  on conflict do nothing;

  -- Stronger Relationships Kit
  insert into public.products (slug, name, description, category_id, base_price, is_customizable, min_order_quantity, occasion_tags, status, is_featured)
  values ('stronger-relationships-kit', 'Stronger Relationships Kit', 'Diary, pen, and keychain in a premium presentation box.', cat_office, 2299, true, 15, array['client','appreciation'], 'active', true)
  on conflict (slug) do update set name = excluded.name returning id into p_id;

  insert into public.product_variants (product_id, name, sku, is_default)
  values (p_id, 'Standard', 'PREM-RELATE-STD', true)
  on conflict (sku) do update set name = excluded.name returning id into v_id;

  insert into public.inventory (variant_id, quantity_available)
  values (v_id, 250)
  on conflict (variant_id) do update set quantity_available = excluded.quantity_available;

  insert into public.product_images (product_id, url, alt_text, sort_order)
  values (p_id, '/images/premium-gifts.png', 'Stronger Relationships Kit', 0)
  on conflict do nothing;

  insert into public.product_collection_mappings (product_id, collection_id)
  values (p_id, col_premium), (p_id, col_hampers)
  on conflict do nothing;
end $$;
