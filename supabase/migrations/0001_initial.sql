create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'main',
  company_name text not null,
  brand_name text not null,
  legal_name text,
  logo_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  primary_phone text,
  whatsapp_number text,
  email text,
  address text,
  city text,
  state text,
  social_links jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '[]'::jsonb,
  default_seo_title text,
  default_seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_only check (singleton_key = 'main')
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  body text,
  page_type text not null,
  hero_image_url text,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  og_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  block_key text not null,
  title text,
  content text,
  media_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, block_key)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  state text not null,
  intro_text text,
  seo_title text,
  seo_description text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  transaction_type text not null default 'sale' check (transaction_type in ('sale', 'rent', 'both')),
  property_type text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'sold', 'reserved')),
  is_published boolean not null default false,
  featured boolean not null default false,
  price numeric(14, 2),
  price_on_request boolean not null default false,
  description text,
  address text,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  city text,
  state text,
  zip_code text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  garages integer not null default 0,
  area_total numeric(12, 2),
  area_useful numeric(12, 2),
  condominium_fee numeric(12, 2),
  iptu_value numeric(12, 2),
  built_year integer,
  furnished boolean not null default false,
  contact_phone text,
  contact_whatsapp text,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  unique (property_id, sort_order)
);

create table if not exists public.property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  value text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (property_id, label)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  source text,
  interest_type text,
  property_id uuid references public.properties(id) on delete set null,
  page_slug text,
  message text,
  status text not null default 'new' check (status in ('new', 'qualified', 'in_progress', 'won', 'lost')),
  notes text,
  assigned_to uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  content text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image_url text,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lead_notes
  add constraint lead_notes_author_id_fkey
  foreign key (author_id) references public.users(id) on delete set null;

alter table public.leads
  add constraint leads_assigned_to_fkey
  foreign key (assigned_to) references public.users(id) on delete set null;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_table text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs
  add constraint audit_logs_actor_id_fkey
  foreign key (actor_id) references public.users(id) on delete set null;

create index if not exists idx_pages_is_published_sort_order on public.pages (is_published, sort_order);
create index if not exists idx_page_blocks_page_id_sort_order on public.page_blocks (page_id, sort_order);
create index if not exists idx_neighborhoods_is_published_sort_order on public.neighborhoods (is_published, sort_order);
create index if not exists idx_properties_is_published_featured on public.properties (is_published, featured, sort_order);
create index if not exists idx_properties_neighborhood_id on public.properties (neighborhood_id);
create index if not exists idx_property_images_property_id_sort_order on public.property_images (property_id, sort_order);
create index if not exists idx_property_features_property_id_sort_order on public.property_features (property_id, sort_order);
create index if not exists idx_leads_status_created_at on public.leads (status, created_at desc);
create index if not exists idx_leads_assigned_to on public.leads (assigned_to);
create index if not exists idx_blog_posts_is_published_published_at on public.blog_posts (is_published, published_at desc);
create index if not exists idx_blog_categories_is_published_sort_order on public.blog_categories (is_published, sort_order);
create index if not exists idx_testimonials_is_published_sort_order on public.testimonials (is_published, sort_order);
create index if not exists idx_users_auth_user_id on public.users (auth_user_id);

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_blocks enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_features enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.users enable row level security;
alter table public.audit_logs enable row level security;

create policy "Site settings public read" on public.site_settings
  for select
  using (true);

create policy "Site settings admin manage" on public.site_settings
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Pages public read published" on public.pages
  for select
  using (is_published = true);

create policy "Pages admin manage" on public.pages
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Page blocks public read active" on public.page_blocks
  for select
  using (
    is_active = true
    and exists (
      select 1
      from public.pages p
      where p.id = page_id
        and p.is_published = true
    )
  );

create policy "Page blocks admin manage" on public.page_blocks
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Neighborhoods public read" on public.neighborhoods
  for select
  using (is_published = true);

create policy "Neighborhoods admin manage" on public.neighborhoods
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Properties public read" on public.properties
  for select
  using (is_published = true);

create policy "Properties admin manage" on public.properties
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Property images public read" on public.property_images
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.is_published = true
    )
  );

create policy "Property images admin manage" on public.property_images
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Property features public read" on public.property_features
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.is_published = true
    )
  );

create policy "Property features admin manage" on public.property_features
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Leads admin manage" on public.leads
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Lead notes admin manage" on public.lead_notes
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Testimonials public read" on public.testimonials
  for select
  using (is_published = true);

create policy "Testimonials admin manage" on public.testimonials
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Blog categories public read" on public.blog_categories
  for select
  using (is_published = true);

create policy "Blog categories admin manage" on public.blog_categories
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Blog posts public read" on public.blog_posts
  for select
  using (is_published = true);

create policy "Blog posts admin manage" on public.blog_posts
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Users self read or admin" on public.users
  for select
  using (auth.uid() = auth_user_id or public.current_user_is_admin());

create policy "Users admin manage" on public.users
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Audit logs admin manage" on public.audit_logs
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create trigger set_updated_at_site_settings
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_updated_at_pages
before update on public.pages
for each row execute function public.set_updated_at();

create trigger set_updated_at_page_blocks
before update on public.page_blocks
for each row execute function public.set_updated_at();

create trigger set_updated_at_neighborhoods
before update on public.neighborhoods
for each row execute function public.set_updated_at();

create trigger set_updated_at_properties
before update on public.properties
for each row execute function public.set_updated_at();

create trigger set_updated_at_leads
before update on public.leads
for each row execute function public.set_updated_at();

create trigger set_updated_at_testimonials
before update on public.testimonials
for each row execute function public.set_updated_at();

create trigger set_updated_at_blog_categories
before update on public.blog_categories
for each row execute function public.set_updated_at();

create trigger set_updated_at_blog_posts
before update on public.blog_posts
for each row execute function public.set_updated_at();

create trigger set_updated_at_users
before update on public.users
for each row execute function public.set_updated_at();
