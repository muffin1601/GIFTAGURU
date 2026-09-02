-- Address book support for the account area.
--
-- public.addresses already existed and was already relational; it was simply
-- unreachable from the UI. This adds the one missing field and an index for
-- the "which address is the default" lookup that checkout performs on every
-- render.

begin;

alter table public.addresses
  add column if not exists landmark text;

-- One default per customer is enforced in the application inside a
-- transaction (see lib/actions/addresses.ts). This index just makes the
-- lookup cheap; it is intentionally not unique, because briefly having zero
-- defaults mid-transaction is legitimate.
create index if not exists addresses_profile_default_idx
  on public.addresses (profile_id, is_default);

commit;
