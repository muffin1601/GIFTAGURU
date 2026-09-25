-- Admin-editable, structured product content. Existing rows retain their
-- description and receive empty arrays, so legacy product pages keep working.
alter table public.products
  add column if not exists long_description text,
  add column if not exists key_features jsonb not null default '[]'::jsonb,
  add column if not exists specifications jsonb not null default '[]'::jsonb,
  add column if not exists package_includes jsonb not null default '[]'::jsonb,
  add column if not exists customization_options jsonb not null default '[]'::jsonb,
  add column if not exists branding_methods jsonb not null default '[]'::jsonb,
  add column if not exists additional_details jsonb not null default '[]'::jsonb,
  add column if not exists faqs jsonb not null default '[]'::jsonb,
  add column if not exists seo_description text,
  add column if not exists content_source text,
  add column if not exists source_url text,
  add column if not exists last_verified_at timestamptz;

alter table public.products
  drop constraint if exists products_key_features_array,
  add constraint products_key_features_array check (jsonb_typeof(key_features) = 'array'),
  drop constraint if exists products_specifications_array,
  add constraint products_specifications_array check (jsonb_typeof(specifications) = 'array'),
  drop constraint if exists products_package_includes_array,
  add constraint products_package_includes_array check (jsonb_typeof(package_includes) = 'array'),
  drop constraint if exists products_customization_options_array,
  add constraint products_customization_options_array check (jsonb_typeof(customization_options) = 'array'),
  drop constraint if exists products_branding_methods_array,
  add constraint products_branding_methods_array check (jsonb_typeof(branding_methods) = 'array'),
  drop constraint if exists products_additional_details_array,
  add constraint products_additional_details_array check (jsonb_typeof(additional_details) = 'array'),
  drop constraint if exists products_faqs_array,
  add constraint products_faqs_array check (jsonb_typeof(faqs) = 'array');

update public.products set
  name = 'Utsav-on-the-go Hamper',
  description = 'Utsav-on-the-go Hamper is thoughtfully curated with a premium 1200ml tumbler, delicious snacks, and festive candle essentials designed to bring warmth, convenience, and celebration, making it an ideal choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.',
  long_description = 'Utsav-on-the-go Hamper is thoughtfully curated with a premium 1200ml tumbler, delicious snacks, and festive candle essentials designed to bring warmth, convenience, and celebration, making it an ideal choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.',
  key_features = $json$[
    {"title":"Premium Large Capacity Tumbler","description":"1200ml tumbler ideal for hydration on the go"},
    {"title":"Healthy Snack Selection","description":"Includes roasted almonds and California pistachios for a nutritious treat"},
    {"title":"Gourmet Cookie Pack","description":"Open Secret Cookies (Pack of 6) for a delicious and guilt-free indulgence"},
    {"title":"Artisanal Mithai Candles","description":"Set of 2 decorative candles inspired by traditional sweets for festive décor"},
    {"title":"Perfect Corporate Diwali Hamper","description":"Thoughtfully curated for professional and festive gifting"},
    {"title":"Balanced Gift Assortment","description":"Combines utility, indulgence, and festive elements"},
    {"title":"Ready-to-Gift Packaging","description":"Elegant presentation suitable for corporate gifting"},
    {"title":"Modern & Festive Appeal","description":"Blends contemporary lifestyle products with traditional Diwali charm"}
  ]$json$::jsonb,
  specifications = $json$[
    {"label":"Product Name","value":"Utsav-on-the-go Hamper"},{"label":"Material (Tumbler)","value":"Stainless Steel / Insulated"},
    {"label":"Capacity (Tumbler)","value":"1200ml"},{"label":"Usage","value":"Gifting, Travel, Daily Use, Festive Celebrations"},
    {"label":"Packaging","value":"Premium Corporate Gift Hamper Box"},{"label":"Net Weight","value":"Combined Hamper Weight (Approx.)"},
    {"label":"Design","value":"Modern Festive Corporate Gift Set"}
  ]$json$::jsonb,
  package_includes = $json$["Premium Tumbler (1200ml)","Nutty Gritties Roasted Almonds (40g)","Nutty Gritties California Pistachios (40g)","Open Secret Cookies (Pack of 6)","Artisanal Mithai Candle Set (Set of 2)"]$json$::jsonb,
  content_source = 'User-provided Diwali hamper references', last_verified_at = now(), updated_at = now()
where slug = 'diwali-signature-hamper';

update public.products set
  name = 'The Diwali Delight Box',
  key_features = $json$[
    {"title":"Premium Copper Bottle","description":"1000ml high-quality copper bottle for a healthy and traditional drinking experience"},
    {"title":"Nutritious Dry Fruits","description":"Includes roasted almonds and California pistachios for a wholesome festive treat"},
    {"title":"Handcrafted Decorative Diyas","description":"Set of 2 diyas to enhance Diwali décor and celebrations"},
    {"title":"Luxury Incense Cones","description":"Phool luxury incense cones for a calming and aromatic festive ambiance"},
    {"title":"Perfect Diwali Gift Hamper","description":"Thoughtfully curated to celebrate the festival of lights"},
    {"title":"Traditional & Elegant Appeal","description":"Blends wellness, tradition, and festive charm"},
    {"title":"Ready-to-Gift Packaging","description":"Ideal for corporate gifting and personal celebrations"},
    {"title":"Balanced Festive Experience","description":"Combines health, décor, and indulgence in one hamper"}
  ]$json$::jsonb,
  specifications = $json$[
    {"label":"Product Name","value":"The Diwali Delight Box"},{"label":"Material (Bottle)","value":"Pure Copper"},
    {"label":"Capacity (Bottle)","value":"1000ml"},{"label":"Usage","value":"Drinking, Gifting, Festive Celebrations"},
    {"label":"Packaging","value":"Premium Gift Hamper Box"},{"label":"Net Weight","value":"Combined Hamper Weight (Approx.)"},
    {"label":"Design","value":"Festive Curated Gift Set"}
  ]$json$::jsonb,
  package_includes = $json$["Premium Copper Bottle (1000ml)","Nutty Gritties Roasted Almonds (40g)","Nutty Gritties California Pistachios (40g)","2 Handcrafted Decorative Diyas","Phool Luxury Incense Cones Pack"]$json$::jsonb,
  content_source = 'User-provided Diwali hamper references', last_verified_at = now(), updated_at = now()
where slug = 'diwali-celebration-hamper';

update public.products set
  name = 'Shubh Utsav Hamper',
  description = 'Diwali Special: Shubh Utsav Gift Hamper is thoughtfully curated with a premium 340ml travel flask, rich coffee, and gourmet snacks designed to create a festive and indulgent experience, making it a perfect choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.',
  long_description = 'Diwali Special: Shubh Utsav Gift Hamper is thoughtfully curated with a premium 340ml travel flask, rich coffee, and gourmet snacks designed to create a festive and indulgent experience, making it a perfect choice for corporate Diwali gifting, employee appreciation, client gifting, festive celebrations, and premium holiday hampers.',
  key_features = $json$[
    {"title":"Premium Black Travel Flask","description":"340ml sleek flask ideal for hot and cold beverages on the go"},
    {"title":"Gourmet Snack Selection","description":"Includes Nutty Gritties Barbeque Almonds & Roasted Pistachios for a rich snacking experience"},
    {"title":"Delicious Cookie Treat","description":"Open Secret Nutty Cookies for a healthy and tasty indulgence"},
    {"title":"Luxury Chocolate Box","description":"Set of 4 Ferrero Rocher chocolates for a premium sweet touch"},
    {"title":"Artisan Coffee Experience","description":"Includes Blue Tokai Coffee Roasters coffee for a refined brew"},
    {"title":"Scented Candle Jar","description":"Adds a warm and festive ambiance to any space"},
    {"title":"Perfect Diwali Gift Hamper","description":"Thoughtfully curated for festive celebrations and gifting"},
    {"title":"Ready-to-Gift Packaging","description":"Elegant presentation ideal for corporate and personal gifting"},
    {"title":"Balanced Gift Assortment","description":"Combines utility, indulgence, and relaxation in one hamper"}
  ]$json$::jsonb,
  specifications = $json$[
    {"label":"Product Name","value":"Shubh Utsav Hamper"},{"label":"Material (Flask)","value":"Stainless Steel (Insulated)"},
    {"label":"Capacity (Flask)","value":"340ml"},{"label":"Usage","value":"Gifting, Travel, Festive Celebrations"},
    {"label":"Packaging","value":"Premium Gift Hamper Box"},{"label":"Net Weight","value":"Combined Hamper Weight (Approx.)"},
    {"label":"Design","value":"Festive Curated Gift Set"}
  ]$json$::jsonb,
  package_includes = $json$["Black Travel Flask (340ml)","Open Secret Nutty Cookies (Box)","Candle Jar","Nutty Gritties Barbeque Almonds (40g)","Nutty Gritties Roasted Pistachios (40g)","Ferrero Rocher Chocolates (Set of 4)","Blue Tokai Coffee Roasters Coffee (Box)"]$json$::jsonb,
  content_source = 'User-provided Diwali hamper references', last_verified_at = now(), updated_at = now()
where slug = 'diwali-grand-hamper';
