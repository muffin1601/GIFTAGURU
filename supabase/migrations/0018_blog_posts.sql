create type public.blog_post_status as enum ('draft', 'published', 'archived');

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 10 and 160),
  excerpt text not null check (char_length(excerpt) between 40 and 500),
  content jsonb not null,
  category text not null check (char_length(category) between 2 and 80),
  featured_image_url text,
  featured_image_alt text,
  author_name text,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  focus_keyword text,
  status public.blog_post_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_published_at_check check (
    (status = 'published' and published_at is not null) or status <> 'published'
  ),
  constraint blog_posts_image_alt_check check (
    featured_image_url is null or char_length(trim(coalesce(featured_image_alt, ''))) > 0
  )
);

create index blog_posts_status_published_at_idx on public.blog_posts(status, published_at desc);
create index blog_posts_category_idx on public.blog_posts(category);
