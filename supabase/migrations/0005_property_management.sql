-- Complete property registration: address visibility and public image storage.
alter table public.properties
  add column if not exists show_full_address boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
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
