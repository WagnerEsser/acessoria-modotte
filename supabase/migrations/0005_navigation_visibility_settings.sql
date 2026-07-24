alter table public.site_settings
  add column if not exists show_blog_navigation boolean not null default false,
  add column if not exists show_areas_navigation boolean not null default false;

comment on column public.site_settings.show_blog_navigation is
  'Controls whether the Blog link appears in public navigation.';

comment on column public.site_settings.show_areas_navigation is
  'Controls whether the Areas link appears in public navigation.';
