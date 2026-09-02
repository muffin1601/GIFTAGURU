-- Server-side cart.
--
-- The cart was previously localStorage-only; public.carts / public.cart_items
-- existed in the schema but had no application code behind them. This makes
-- them the source of truth and adds the constraints that make repeated adds
-- idempotent.
--
-- Safe to run against a populated database: the dedupe below folds any
-- pre-existing duplicate lines together before the unique index is created.

begin;

-- Guest carts are addressed by an opaque token mirrored in the httpOnly
-- `gg_cart` cookie. Unique so a replayed cookie resolves to one cart rather
-- than fanning out into several.
alter table public.carts
  add column if not exists session_token text;

-- Plain (not partial) unique index, matching what Prisma's `@unique` on an
-- optional field expects. Postgres already permits many NULLs in a unique
-- index, so guest-less carts are unaffected.
create unique index if not exists carts_session_token_key
  on public.carts (session_token);

create index if not exists carts_status_idx
  on public.carts (status);

-- Digest of the normalised customization payload. Postgres can compare jsonb
-- directly, but Prisma cannot place a Json column in a composite unique, so
-- the digest is materialised as its own column. Empty string means "no
-- customization", which is the common case.
alter table public.cart_items
  add column if not exists customization_key text not null default '';

-- Fold any duplicate lines into one before the unique index goes on, keeping
-- the oldest row and summing the quantities. A no-op on a database that never
-- ran the client-side cart, but this must not fail on one that did.
with ranked as (
  select
    id,
    cart_id,
    variant_id,
    customization_key,
    quantity,
    row_number() over (
      partition by cart_id, variant_id, customization_key
      order by created_at, id
    ) as rn,
    sum(quantity) over (partition by cart_id, variant_id, customization_key) as merged_quantity
  from public.cart_items
)
update public.cart_items ci
set quantity = ranked.merged_quantity
from ranked
where ci.id = ranked.id
  and ranked.rn = 1
  and ranked.merged_quantity <> ci.quantity;

delete from public.cart_items ci
using (
  select
    id,
    row_number() over (
      partition by cart_id, variant_id, customization_key
      order by created_at, id
    ) as rn
  from public.cart_items
) ranked
where ci.id = ranked.id
  and ranked.rn > 1;

-- The invariant behind "add the same thing 5 times => quantity 5, not 5 rows".
-- Enforced here rather than only in application code so a double-submit that
-- races past the read-then-write still cannot create a second row.
-- Name matches Prisma's default for @@unique([cartId, variantId, customizationKey]),
-- so the generated client and the database agree if the schema is ever diffed.
create unique index if not exists cart_items_cart_id_variant_id_customization_key_key
  on public.cart_items (cart_id, variant_id, customization_key);

commit;
