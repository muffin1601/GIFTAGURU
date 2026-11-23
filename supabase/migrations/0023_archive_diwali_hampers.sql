-- Diwali 2026 is over: take every Diwali hamper and Diwali kit off the
-- storefront. Rows are archived rather than deleted so past orders keep their
-- product references and the products can be re-activated next season.

update public.products
set status = 'archived',
    is_featured = false
where slug in (
  -- Hampers (public/Hampers)
  'diwali-signature-hamper',
  'diwali-celebration-hamper',
  'diwali-grand-hamper',
  -- Diwali kits (public/Diwali kits)
  'white-festive-flask-tumbler-hamper',
  'tan-executive-diary-flask-gift-set',
  'white-notebook-flask-gift-set',
  'copper-festive-bottle-diya-hamper',
  'copper-celebration-hamper',
  'black-festive-flask-cookie-hamper',
  'black-celebration-flask-mug-hamper',
  'executive-black-mug-diary-gift-box',
  'premium-diya-glass-gift-box'
);
