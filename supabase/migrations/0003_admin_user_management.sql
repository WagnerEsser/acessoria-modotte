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
