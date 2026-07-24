import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("migration and seed contract", () => {
  it("keeps the initial schema closed to public admin bootstrap and direct lead insert", () => {
    const sql = readFileSync(
      path.resolve("supabase/migrations/0001_initial.sql"),
      "utf8",
    );

    expect(sql).toContain("create table if not exists public.properties");
    expect(sql).toContain("create table if not exists public.leads");
    expect(sql).toContain("create table if not exists public.users");
    expect(sql).toContain("email text");
    expect(sql).toContain("impact_phrase text");
    expect(sql).toContain(
      "create or replace function public.sync_new_auth_user()",
    );
    expect(sql).toContain(
      "create or replace function public.sync_auth_user_profile()",
    );
    expect(sql).toContain(
      "values (new.id, full_name, lower(new.email), 'editor', false)",
    );
    expect(sql).not.toContain(
      "create or replace function public.bootstrap_first_admin()",
    );
    expect(sql).not.toContain('create policy "Leads public insert"');
    expect(sql).toContain("create trigger on_auth_user_created");
    expect(sql).toContain("create trigger on_auth_user_updated");
  });

  it("ships rate limiting, private lead ingestion, and audit logging hardening", () => {
    const sql = readFileSync(
      path.resolve("supabase/migrations/0002_security_hardening.sql"),
      "utf8",
    );

    expect(sql).toContain('drop policy if exists "Leads public insert"');
    expect(sql).toContain(
      "create table if not exists public.security_rate_limits",
    );
    expect(sql).toContain(
      "create or replace function public.consume_security_rate_limit",
    );
    expect(sql).toContain(
      "grant execute on function public.consume_security_rate_limit",
    );
    expect(sql).toContain(
      "create or replace function public.audit_admin_mutation",
    );
    expect(sql).toContain("create trigger audit_properties_mutation");
    expect(sql).toContain(
      "drop function if exists public.bootstrap_first_admin()",
    );
    expect(sql).toContain('create policy "Audit logs admin read"');
    expect(sql).toContain(
      "revoke insert, update, delete, truncate on table public.audit_logs",
    );
  });

  it("uses explicit least-privilege grants for the cloud Data API", () => {
    const sql = readFileSync(
      path.resolve("supabase/migrations/0004_explicit_data_api_grants.sql"),
      "utf8",
    );

    expect(sql).toContain(
      "revoke all on all tables in schema public from anon, authenticated, service_role",
    );
    expect(sql).toContain("public.properties");
    expect(sql).toContain("to anon;");
    expect(sql).toContain("public.leads");
    expect(sql).toContain("to authenticated;");
    expect(sql).toContain("grant insert on table public.leads to service_role");
    expect(sql).toContain(
      "grant select, insert, update on table public.users to service_role",
    );
    expect(sql).toContain(
      'alter policy "Properties public read" on public.properties',
    );
    expect(sql).toContain(
      'alter policy "Properties admin manage" on public.properties',
    );
    expect(sql).toContain(
      "grant execute on function public.current_user_is_admin() to authenticated",
    );
    expect(sql).toContain(
      "grant execute on function public.consume_security_rate_limit(text, integer, integer)",
    );
    expect(sql).not.toContain(
      "grant select, insert, update, delete on all tables in schema public",
    );
  });

  it("adds navigation visibility settings with disabled defaults", () => {
    const sql = readFileSync(
      path.resolve(
        "supabase/migrations/0005_navigation_visibility_settings.sql",
      ),
      "utf8",
    );

    expect(sql).toContain(
      "show_blog_navigation boolean not null default false",
    );
    expect(sql).toContain(
      "show_areas_navigation boolean not null default false",
    );
  });

  it("ships editorial seed data for the first boot", () => {
    const sql = readFileSync(
      path.resolve("supabase/seeds/0001_initial_seed.sql"),
      "utf8",
    );

    expect(sql).toContain("luana.modotte@gmail.com");
    expect(sql).toContain("luana.modotte");
    expect(sql).toContain(
      "O seu coração escolhe o lar. Nossa assessoria garante o negócio.",
    );
    expect(sql).toContain("'sobre'");
    expect(sql).toContain("'servicos'");
    expect(sql).toContain("'compra-assistida'");
    expect(sql).toContain("'venda-estrategica'");
    expect(sql).toContain("'analise-documental'");
  });

  it("mounts the project schema and seed into the self-hosted supabase database", () => {
    const compose = readFileSync(
      path.resolve("supabase/docker/docker-compose.yml"),
      "utf8",
    );

    expect(compose).toContain("../migrations/0001_initial.sql");
    expect(compose).toContain("../migrations/0002_security_hardening.sql");
    expect(compose).toContain("../migrations/0003_admin_user_management.sql");
    expect(compose).toContain(
      "../migrations/0004_explicit_data_api_grants.sql",
    );
    expect(compose).toContain(
      "../migrations/0005_navigation_visibility_settings.sql",
    );
    expect(compose).toContain("../seeds/0001_initial_seed.sql");
    expect(compose).toContain(
      "/docker-entrypoint-initdb.d/init-scripts/96-project-schema.sql",
    );
    expect(compose).toContain(
      "/docker-entrypoint-initdb.d/init-scripts/97-project-seed.sql",
    );
  });
});
