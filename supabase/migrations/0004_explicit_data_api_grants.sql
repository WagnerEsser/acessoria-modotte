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
alter policy "Blog categories public read" on public.blog_categories
  to anon, authenticated;
alter policy "Blog posts public read" on public.blog_posts
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
alter policy "Property features admin manage" on public.property_features
  to authenticated;
alter policy "Leads admin manage" on public.leads
  to authenticated;
alter policy "Lead notes admin manage" on public.lead_notes
  to authenticated;
alter policy "Testimonials admin manage" on public.testimonials
  to authenticated;
alter policy "Blog categories admin manage" on public.blog_categories
  to authenticated;
alter policy "Blog posts admin manage" on public.blog_posts
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
  public.property_features,
  public.testimonials,
  public.blog_categories,
  public.blog_posts
to anon;

grant select on table
  public.site_settings,
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_features,
  public.leads,
  public.lead_notes,
  public.testimonials,
  public.blog_categories,
  public.blog_posts,
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
  public.property_features,
  public.testimonials,
  public.blog_categories,
  public.blog_posts
to authenticated;

grant delete on table
  public.pages,
  public.page_blocks,
  public.neighborhoods,
  public.properties,
  public.property_images,
  public.property_features,
  public.testimonials,
  public.blog_categories,
  public.blog_posts
to authenticated;

grant update on table public.leads, public.users to authenticated;
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
