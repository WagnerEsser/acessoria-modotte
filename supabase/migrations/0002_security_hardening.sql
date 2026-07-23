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
