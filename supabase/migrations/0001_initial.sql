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
  impact_phrase text,
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
  is_active boolean not null default false,
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
  show_full_address boolean not null default false,
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

create table if not exists public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  url text not null,
  file_name text,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  sort_order integer not null default 0,
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
  status text not null default 'new' check (status in ('new', 'read', 'qualified', 'in_progress', 'won', 'lost')),
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

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
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
create index if not exists idx_property_videos_property_id_sort_order on public.property_videos (property_id, sort_order);
create index if not exists idx_property_features_property_id_sort_order on public.property_features (property_id, sort_order);
create index if not exists idx_leads_status_created_at on public.leads (status, created_at desc);
create index if not exists idx_leads_assigned_to on public.leads (assigned_to);
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

create or replace function public.sync_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
begin
  full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(new.email, ''), '@', 1), '.', ' '))
  );

  if full_name is null or full_name = '' then
    full_name := 'Usuario';
  end if;

  insert into public.users (auth_user_id, full_name, email, role, is_active)
  values (new.id, full_name, lower(new.email), 'editor', false)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_full_name text;
begin
  resolved_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(new.email, ''), '@', 1), '.', ' '))
  );

  if resolved_full_name is null or resolved_full_name = '' then
    resolved_full_name := 'Usuario';
  end if;

  insert into public.users (auth_user_id, full_name, email, role, is_active)
  values (
    new.id,
    resolved_full_name,
    lower(new.email),
    coalesce(
      (select role from public.users where auth_user_id = new.id),
      'editor'
    ),
    coalesce(
      (select is_active from public.users where auth_user_id = new.id),
      false
    )
  )
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_blocks enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_videos enable row level security;
alter table public.property_features enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.testimonials enable row level security;
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

create policy "Property videos public read" on public.property_videos
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.is_published = true
        and p.status <> 'hidden'
    )
  );

create policy "Property videos admin manage" on public.property_videos
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

create policy "Users self read or admin" on public.users
  for select
  using (auth.uid() = auth_user_id or public.current_user_is_admin());

create policy "Users admin manage" on public.users
  for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Audit logs admin read" on public.audit_logs
  for select
  using (public.current_user_is_admin());

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

create trigger set_updated_at_users
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_new_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_profile();
-- Consolidated from 0002_security_hardening.sql during the initial schema bootstrap.
-- Security hardening for existing installations.

create or replace function public.sync_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
begin
  full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(new.email, ''), '@', 1), '.', ' '))
  );

  if full_name is null or full_name = '' then
    full_name := 'Usuario';
  end if;

  insert into public.users (auth_user_id, full_name, email, role, is_active)
  values (new.id, full_name, lower(new.email), 'editor', false)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

revoke all on function public.sync_new_auth_user() from public, anon, authenticated;
alter table public.users alter column is_active set default false;

drop function if exists public.bootstrap_first_admin();

drop policy if exists "Leads public insert" on public.leads;
drop policy if exists "Audit logs admin manage" on public.audit_logs;
drop policy if exists "Audit logs admin read" on public.audit_logs;
create policy "Audit logs admin read" on public.audit_logs
  for select
  using (public.current_user_is_admin());
revoke insert, update, delete, truncate on table public.audit_logs
  from public, anon, authenticated;

do $$
begin
  if to_regclass('public.lead_submission_limits') is not null
    and to_regclass('public.security_rate_limits') is null
  then
    alter table public.lead_submission_limits rename to security_rate_limits;
  end if;
end
$$;

create table if not exists public.security_rate_limits (
  identifier_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.security_rate_limits enable row level security;
revoke all on table public.security_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.security_rate_limits to service_role;
create index if not exists idx_security_rate_limits_updated_at
  on public.security_rate_limits (updated_at);

create or replace function public.consume_security_rate_limit(
  p_identifier_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  accepted boolean;
begin
  if p_identifier_hash is null
    or length(p_identifier_hash) <> 64
    or p_limit < 1
    or p_limit > 100
    or p_window_seconds < 60
    or p_window_seconds > 86400
  then
    return false;
  end if;

  delete from public.security_rate_limits
  where updated_at < now() - interval '7 days';

  insert into public.security_rate_limits (
    identifier_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_identifier_hash, now(), 1, now())
  on conflict (identifier_hash) do update
    set window_started_at = case
          when security_rate_limits.window_started_at
            <= now() - make_interval(secs => p_window_seconds)
            then now()
          else security_rate_limits.window_started_at
        end,
        request_count = case
          when security_rate_limits.window_started_at
            <= now() - make_interval(secs => p_window_seconds)
            then 1
          else security_rate_limits.request_count + 1
        end,
        updated_at = now()
  returning request_count <= p_limit into accepted;

  return accepted;
end;
$$;

revoke all on function public.consume_security_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_security_rate_limit(text, integer, integer)
  to service_role;
drop function if exists public.consume_lead_rate_limit(text, integer, integer);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_name_length_check'
  ) then
    alter table public.leads
      add constraint leads_name_length_check
      check (char_length(name) between 2 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_email_length_check'
  ) then
    alter table public.leads
      add constraint leads_email_length_check
      check (email is null or char_length(email) <= 254);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_phone_length_check'
  ) then
    alter table public.leads
      add constraint leads_phone_length_check
      check (phone is null or char_length(phone) between 8 and 20);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'leads_message_length_check'
  ) then
    alter table public.leads
      add constraint leads_message_length_check
      check (message is null or char_length(message) <= 3500);
  end if;
end
$$;

create or replace function public.audit_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_user_id uuid;
  entity_identifier text;
begin
  select id
    into actor_user_id
  from public.users
  where auth_user_id = auth.uid()
    and is_active = true;

  if actor_user_id is null then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  if tg_op = 'DELETE' then
    entity_identifier := old.id::text;
  else
    entity_identifier := new.id::text;
  end if;

  insert into public.audit_logs (actor_id, action, entity_table, entity_id, payload)
  values (
    actor_user_id,
    lower(tg_op),
    tg_table_name,
    entity_identifier,
    jsonb_build_object('source', 'database-trigger')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.audit_admin_mutation() from public, anon, authenticated;

drop trigger if exists audit_site_settings_mutation on public.site_settings;
create trigger audit_site_settings_mutation
after insert or update or delete on public.site_settings
for each row execute function public.audit_admin_mutation();

drop trigger if exists audit_pages_mutation on public.pages;
create trigger audit_pages_mutation
after insert or update or delete on public.pages
for each row execute function public.audit_admin_mutation();

drop trigger if exists audit_page_blocks_mutation on public.page_blocks;
create trigger audit_page_blocks_mutation
after insert or update or delete on public.page_blocks
for each row execute function public.audit_admin_mutation();

drop trigger if exists audit_neighborhoods_mutation on public.neighborhoods;
create trigger audit_neighborhoods_mutation
after insert or update or delete on public.neighborhoods
for each row execute function public.audit_admin_mutation();

drop trigger if exists audit_properties_mutation on public.properties;
create trigger audit_properties_mutation
after insert or update or delete on public.properties
for each row execute function public.audit_admin_mutation();
-- Consolidated from 0003_admin_user_management.sql during the initial schema bootstrap.
-- Simple multi-user administration for the management panel.

alter table public.users
  add column if not exists email text;

update public.users profile
set email = lower(auth_user.email)
from auth.users auth_user
where profile.auth_user_id = auth_user.id
  and profile.email is distinct from lower(auth_user.email);

create unique index if not exists idx_users_email_lower
  on public.users (lower(email))
  where email is not null;

create or replace function public.sync_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_full_name text;
begin
  resolved_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(new.email, ''), '@', 1), '.', ' '))
  );

  if resolved_full_name is null or resolved_full_name = '' then
    resolved_full_name := 'Usuario';
  end if;

  insert into public.users (auth_user_id, full_name, email, role, is_active)
  values (new.id, resolved_full_name, lower(new.email), 'editor', false)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_full_name text;
begin
  resolved_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(new.email, ''), '@', 1), '.', ' '))
  );

  if resolved_full_name is null or resolved_full_name = '' then
    resolved_full_name := 'Usuario';
  end if;

  insert into public.users (auth_user_id, full_name, email, role, is_active)
  values (new.id, resolved_full_name, lower(new.email), 'editor', false)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

revoke all on function public.sync_new_auth_user() from public, anon, authenticated;
revoke all on function public.sync_auth_user_profile() from public, anon, authenticated;
-- Consolidated from 0004_explicit_data_api_grants.sql during the initial schema bootstrap.
-- Explicit Data API grants for projects created with
-- "Automatically expose new tables" disabled.
--
-- Grants decide which objects a role can reach. RLS policies still decide
-- which rows that role may read or mutate.

grant usage on schema public to anon, authenticated, service_role;
revoke create on schema public from public;

revoke all on all tables in schema public from anon, authenticated, service_role;

alter policy "Site settings public read" on public.site_settings
  to anon, authenticated;
alter policy "Pages public read published" on public.pages
  to anon, authenticated;
alter policy "Page blocks public read active" on public.page_blocks
  to anon, authenticated;
alter policy "Neighborhoods public read" on public.neighborhoods
  to anon, authenticated;
alter policy "Properties public read" on public.properties
  to anon, authenticated;
alter policy "Property images public read" on public.property_images
  to anon, authenticated;
alter policy "Property features public read" on public.property_features
  to anon, authenticated;
alter policy "Testimonials public read" on public.testimonials
  to anon, authenticated;

alter policy "Site settings admin manage" on public.site_settings
  to authenticated;
alter policy "Pages admin manage" on public.pages
  to authenticated;
alter policy "Page blocks admin manage" on public.page_blocks
  to authenticated;
alter policy "Neighborhoods admin manage" on public.neighborhoods
  to authenticated;
alter policy "Properties admin manage" on public.properties
  to authenticated;
alter policy "Property images admin manage" on public.property_images
  to authenticated;
alter policy "Property videos admin manage" on public.property_videos
  to authenticated;
alter policy "Property features admin manage" on public.property_features
  to authenticated;
alter policy "Leads admin manage" on public.leads
  to authenticated;
alter policy "Lead notes admin manage" on public.lead_notes
  to authenticated;
alter policy "Testimonials admin manage" on public.testimonials
  to authenticated;
alter policy "Users self read or admin" on public.users
  to authenticated;
alter policy "Users admin manage" on public.users
  to authenticated;
alter policy "Audit logs admin read" on public.audit_logs
  to authenticated;

grant select on table
  public.site_settings,
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_videos,
  public.property_features,
  public.testimonials
to anon;

grant select on table
  public.site_settings,
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_videos,
  public.property_features,
  public.leads,
  public.lead_notes,
  public.testimonials,
  public.users,
  public.audit_logs
to authenticated;

grant insert, update on table
  public.site_settings,
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_videos,
  public.property_features,
  public.testimonials
to authenticated;

grant delete on table
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_videos,
  public.property_features,
  public.testimonials
to authenticated;

grant update, delete on table public.leads to authenticated;
grant update on table public.users to authenticated;
grant insert, update, delete on table public.lead_notes to authenticated;

grant insert on table public.leads to service_role;
grant select, insert, update on table public.users to service_role;

revoke all on function public.current_user_is_admin()
  from public, anon, authenticated, service_role;
grant execute on function public.current_user_is_admin() to authenticated;

revoke all on function public.set_updated_at()
  from public, anon, authenticated, service_role;
revoke all on function public.sync_new_auth_user()
  from public, anon, authenticated, service_role;
revoke all on function public.sync_auth_user_profile()
  from public, anon, authenticated, service_role;
revoke all on function public.audit_admin_mutation()
  from public, anon, authenticated, service_role;

revoke all on function public.consume_security_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_security_rate_limit(text, integer, integer)
  to service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

-- Consolidated from 0005_navigation_visibility_settings.sql during the initial schema bootstrap.
alter table public.site_settings
  add column if not exists show_areas_navigation boolean not null default false;

comment on column public.site_settings.show_areas_navigation is
  'Controls whether the Areas link appears in public navigation.';
-- Consolidated from 0006_superadmin_roles.sql during the initial schema bootstrap.
-- Separate the owner account from day-to-day administrators.
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('superadmin', 'admin', 'editor'));

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where auth_user_id = auth.uid()
      and role in ('admin', 'superadmin')
      and is_active = true
  );
$$;

create or replace function public.current_user_is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where auth_user_id = auth.uid()
      and role = 'superadmin'
      and is_active = true
  );
$$;

revoke all on function public.current_user_is_admin() from public, anon, authenticated;
revoke all on function public.current_user_is_superadmin() from public, anon, authenticated;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_superadmin() to authenticated;

alter policy "Site settings admin manage" on public.site_settings
  using (public.current_user_is_superadmin())
  with check (public.current_user_is_superadmin());
alter policy "Pages admin manage" on public.pages
  using (public.current_user_is_superadmin())
  with check (public.current_user_is_superadmin());
alter policy "Page blocks admin manage" on public.page_blocks
  using (public.current_user_is_superadmin())
  with check (public.current_user_is_superadmin());
alter policy "Users self read or admin" on public.users
  using (auth.uid() = auth_user_id or public.current_user_is_superadmin());
alter policy "Users admin manage" on public.users
  using (public.current_user_is_superadmin())
  with check (public.current_user_is_superadmin());

-- Consolidated from the property management and property video migrations.
-- Storage is configured here so a fresh local or hosted database needs only
-- this schema file plus the seed file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-videos',
  'property-videos',
  true,
  52428800,
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Property image objects public read" on storage.objects;
create policy "Property image objects public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-images');

drop policy if exists "Property image objects admin insert" on storage.objects;
create policy "Property image objects admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-images' and public.current_user_is_admin());

drop policy if exists "Property image objects admin update" on storage.objects;
create policy "Property image objects admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-images' and public.current_user_is_admin())
  with check (bucket_id = 'property-images' and public.current_user_is_admin());

drop policy if exists "Property image objects admin delete" on storage.objects;
create policy "Property image objects admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-images' and public.current_user_is_admin());

drop policy if exists "Property video objects public read" on storage.objects;
create policy "Property video objects public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-videos');

drop policy if exists "Property video objects admin insert" on storage.objects;
create policy "Property video objects admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-videos' and public.current_user_is_admin());

drop policy if exists "Property video objects admin update" on storage.objects;
create policy "Property video objects admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-videos' and public.current_user_is_admin())
  with check (bucket_id = 'property-videos' and public.current_user_is_admin());

drop policy if exists "Property video objects admin delete" on storage.objects;
create policy "Property video objects admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-videos' and public.current_user_is_admin());
