-- Every product carried avg_rating 4.8 with a review_count of 18 + its set
-- number (42, 41, 40, ...) straight from the catalogue seed, while the reviews
-- table held zero rows. That published invented social proof on a live store.
--
-- Recompute both columns from the reviews that actually exist. Products with no
-- reviews fall to 0/0 and the storefront then hides the rating entirely.

update public.products p
set
  avg_rating = coalesce(r.avg_rating, 0),
  review_count = coalesce(r.review_count, 0)
from (
  select
    p2.id,
    round(avg(rv.rating)::numeric, 1) as avg_rating,
    count(rv.id)::int as review_count
  from public.products p2
  left join public.reviews rv on rv.product_id = p2.id
  group by p2.id
) r
where r.id = p.id;
