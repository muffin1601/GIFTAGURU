-- Employee Welcome Kits shares Joining Gifts' banner artwork, so it rendered as
-- a duplicate card in the homepage "Shop by Category" grid. Drop it from the
-- featured set; the collection itself stays browsable at /categories.

update public.collections
set is_featured = false
where slug = 'employee-welcome-kits';
