-- Separate the owner account from day-to-day administrators.
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('superadmin', 'admin', 'editor'));

-- The Luana owner account is the only account promoted automatically.
update public.users
set role = 'superadmin', updated_at = now()
where lower(coalesce(email, '')) = 'admin@email.com'
   or lower(trim(full_name)) = 'luana modotte';

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
