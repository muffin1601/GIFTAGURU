-- Seeds the faqs table with the real FAQ copy that was previously hardcoded
-- in data/faqs.ts, now that /admin/faqs manages this content. This is not
-- placeholder content -- it is the actual copy already live on the site.

insert into public.faqs (question, answer, sort_order) values
  ('What is the minimum bulk order quantity?',
   'Minimum order quantity is 5 products across the store. Reach out with your requirement and we''ll confirm any product-specific bulk guidance.',
   0),
  ('Can gifts be customized with our company branding?',
   'Yes. We offer logo embossing, custom packaging, branded inserts, and personalized messaging across our gifting collections.',
   1),
  ('Do you deliver across India?',
   'Yes, we deliver pan-India, including multi-location dispatch for distributed teams and multi-city events.',
   2),
  ('How long does bulk order fulfillment take?',
   'Standard bulk orders are fulfilled within 7-12 business days depending on customization complexity and order volume. Rush timelines can be discussed for urgent requirements.',
   3),
  ('Can we request a custom gift box?',
   'Absolutely. Share your budget, occasion, and branding requirements, and our team will curate a custom gift box and share a quote.',
   4)
on conflict do nothing;
