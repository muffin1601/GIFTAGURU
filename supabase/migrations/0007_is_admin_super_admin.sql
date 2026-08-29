-- is_admin() backs the RLS policies for every admin-facing table, but it only
-- matched role = 'admin'. A super_admin was therefore denied by every one of
-- those policies. Match both admin roles.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;
