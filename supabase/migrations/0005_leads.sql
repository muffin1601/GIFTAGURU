do $$ begin
  create type public.lead_type as enum (
    'general',
    'contact',
    'bulk_order',
    'product',
    'collection',
    'customization',
    'chatbot',
    'consultation'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_status as enum (
    'new',
    'contacted',
    'qualified',
    'quoted',
    'negotiating',
    'converted',
    'closed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type public.lead_type not null,
  name text not null,
  company text,
  email text not null,
  phone text not null,
  message text not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  product_slug text,
  product_url text,
  collection_id uuid references public.collections(id) on delete set null,
  collection_name text,
  quantity text,
  budget text,
  total_budget text,
  delivery_date date,
  delivery_location text,
  branding_required boolean not null default false,
  branding_options text[] not null default '{}',
  logo_url text,
  source text not null,
  status public.lead_status not null default 'new',
  admin_notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_type_idx on public.leads(type);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_source_idx on public.leads(source);
create index if not exists leads_created_at_idx on public.leads(created_at);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert with check (true);

drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());
