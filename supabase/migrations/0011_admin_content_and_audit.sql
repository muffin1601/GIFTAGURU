-- Enterprise admin: content tables (FAQs, testimonials), an audit trail for
-- admin mutations, and publish/archive flags for categories and collections
-- so routine catalog work never requires a database console.

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_sort_order_idx on public.faqs (sort_order);

drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

create policy "Public can read published faqs" on public.faqs
  for select using (is_published = true);

create policy "Admins manage faqs" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  company text,
  quote text not null,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "Public can read published testimonials" on public.testimonials
  for select using (is_published = true);

create policy "Admins manage testimonials" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Audit trail for admin mutations. actor_email is a snapshot so history
-- survives an admin account being removed; actor_id is nullable for the
-- same reason.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

create policy "Admins read audit logs" on public.audit_logs
  for select using (public.is_admin());

create policy "Service role writes audit logs" on public.audit_logs
  for insert with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Publish/archive flags so routine catalog work doesn't require deletes.

alter table public.categories add column if not exists is_active boolean not null default true;
alter table public.collections add column if not exists is_published boolean not null default true;
