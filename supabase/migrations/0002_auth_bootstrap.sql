create or replace function public.sync_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  role_name text;
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

  if exists (select 1 from public.users) then
    role_name := 'editor';
  else
    role_name := 'admin';
  end if;

  insert into public.users (auth_user_id, full_name, role, is_active)
  values (new.id, full_name, role_name, true)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_new_auth_user();

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

  insert into public.users (auth_user_id, full_name, role, is_active)
  values (
    new.id,
    resolved_full_name,
    coalesce(
      (select role from public.users where auth_user_id = new.id),
      'editor'
    ),
    true
  )
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_profile();

create or replace function public.bootstrap_first_admin()
returns public.users
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_user_id uuid := auth.uid();
  auth_email text;
  metadata jsonb;
  full_name text;
  created_user public.users;
begin
  if auth_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if exists (select 1 from public.users) then
    raise exception 'bootstrap_not_allowed' using errcode = '42501';
  end if;

  select email, raw_user_meta_data
    into auth_email, metadata
  from auth.users
  where id = auth_user_id;

  full_name := coalesce(
    nullif(trim(metadata ->> 'full_name'), ''),
    nullif(trim(metadata ->> 'name'), ''),
    nullif(trim(metadata ->> 'display_name'), ''),
    initcap(replace(split_part(coalesce(auth_email, ''), '@', 1), '.', ' '))
  );

  if full_name is null or full_name = '' then
    full_name := 'Administrador';
  end if;

  insert into public.users (auth_user_id, full_name, role, is_active)
  values (auth_user_id, full_name, 'admin', true)
  on conflict (auth_user_id) do update
    set full_name = excluded.full_name,
        role = 'admin',
        is_active = true,
        updated_at = now()
  returning * into created_user;

  return created_user;
end;
$$;

grant execute on function public.bootstrap_first_admin() to authenticated;
