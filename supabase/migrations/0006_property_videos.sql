-- Add public property videos and their protected admin storage flow.
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

create index if not exists idx_property_videos_property_id_sort_order
  on public.property_videos (property_id, sort_order);

alter table public.property_videos enable row level security;

drop policy if exists "Property videos public read" on public.property_videos;
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

drop policy if exists "Property videos admin manage" on public.property_videos;
create policy "Property videos admin manage" on public.property_videos
  for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

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

grant select on table public.property_videos to anon, authenticated;
grant insert, update, delete on table public.property_videos to authenticated;
