-- Refresh only the original seeded homepage FAQs. The answer predicate keeps
-- administrator-edited rows intact while allowing untouched installations to
-- receive the improved buyer-focused, keyword-aligned copy.

update public.faqs
set question = 'What corporate gifting services does Gifta Guru offer in India?',
    answer = 'Gifta Guru helps businesses plan custom corporate gifts for employees, clients, events and festive programmes. Our team can support product curation, logo branding, personalised cards, custom packaging, bulk fulfilment and delivery across India.',
    sort_order = 0,
    updated_at = now()
where question = 'What is the minimum bulk order quantity?'
  and answer = 'Minimum order quantity is 5 products across the store. Reach out with your requirement and we''ll confirm any product-specific bulk guidance.';

update public.faqs
set question = 'Can you customise corporate gifts with our company logo?',
    answer = 'Yes. Depending on the product, custom corporate gifts can include logo printing, laser engraving, embossing, branded sleeves, personalised messages and custom gift boxes. We confirm the most suitable branding method before production.',
    sort_order = 1,
    updated_at = now()
where question = 'Can gifts be customized with our company branding?'
  and answer = 'Yes. We offer logo embossing, custom packaging, branded inserts, and personalized messaging across our gifting collections.';

update public.faqs
set question = 'Which corporate gifts work well for employees and new joiners?',
    answer = 'Useful corporate gifts usually work best: notebooks, pens, planners, desk accessories and curated employee welcome kits. We can build one consistent set for a team or create different tiers for onboarding, recognition and work milestones.',
    sort_order = 2,
    updated_at = now()
where question = 'Do you deliver across India?'
  and answer = 'Yes, we deliver pan-India, including multi-location dispatch for distributed teams and multi-city events.';

update public.faqs
set question = 'What is the minimum order quantity for bulk corporate gifts?',
    answer = 'The store-wide minimum is 5 products. Some products or branding methods may have a different minimum order quantity, so share your preferred item, quantity and customisation requirements for a confirmed quote.',
    sort_order = 3,
    updated_at = now()
where question = 'How long does bulk order fulfillment take?'
  and answer = 'Standard bulk orders are fulfilled within 7-12 business days depending on customization complexity and order volume. Rush timelines can be discussed for urgent requirements.';

update public.faqs
set question = 'Do you deliver corporate gifts across India?',
    answer = 'Yes. We support pan-India delivery, including bulk dispatch to one office and multi-location delivery for remote employees, distributed teams and events in multiple cities. Final timelines depend on the address list and order size.',
    sort_order = 4,
    updated_at = now()
where question = 'Can we request a custom gift box?'
  and answer = 'Absolutely. Share your budget, occasion, and branding requirements, and our team will curate a custom gift box and share a quote.';

insert into public.faqs (question, answer, sort_order)
select
  'How long do customised bulk corporate gift orders take?',
  'Most bulk orders are completed in 7-12 business days after the products, artwork and payment are approved. More complex custom packaging or large multi-location programmes may need additional time, while urgent timelines can be reviewed with our team.',
  5
where not exists (
  select 1 from public.faqs
  where question = 'How long do customised bulk corporate gift orders take?'
);

insert into public.faqs (question, answer, sort_order)
select
  'Can Gifta Guru create a corporate gift box for our budget?',
  'Yes. Tell us your budget per recipient, audience, occasion, quantity, branding needs and delivery plan. We will recommend a curated corporate gift box that balances usefulness, presentation and cost without adding unnecessary filler.',
  6
where not exists (
  select 1 from public.faqs
  where question = 'Can Gifta Guru create a corporate gift box for our budget?'
);
