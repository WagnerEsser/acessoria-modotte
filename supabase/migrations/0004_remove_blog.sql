-- Blog was removed before production. This keeps existing development databases aligned.
drop table if exists public.blog_posts cascade;
drop table if exists public.blog_categories cascade;

alter table if exists public.site_settings
  drop column if exists show_blog_navigation;

delete from public.pages
where slug = 'blog';
