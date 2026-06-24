import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("migration and seed contract", () => {
  it("keeps schema, auth bootstrap, and public lead policy in the initial migration", () => {
    const sql = readFileSync(
      path.resolve("supabase/migrations/0001_initial.sql"),
      "utf8"
    );

    expect(sql).toContain("create table if not exists public.properties");
    expect(sql).toContain("create table if not exists public.leads");
    expect(sql).toContain("create table if not exists public.users");
    expect(sql).toContain("impact_phrase text");
    expect(sql).toContain("create or replace function public.sync_new_auth_user()");
    expect(sql).toContain("create or replace function public.sync_auth_user_profile()");
    expect(sql).toContain("create or replace function public.bootstrap_first_admin()");
    expect(sql).toContain('create policy "Leads public insert"');
    expect(sql).toContain("create trigger on_auth_user_created");
    expect(sql).toContain("create trigger on_auth_user_updated");
  });

  it("ships editorial seed data for the first boot", () => {
    const sql = readFileSync(
      path.resolve("supabase/seeds/0001_initial_seed.sql"),
      "utf8"
    );

    expect(sql).toContain("luana.modotte@gmail.com");
    expect(sql).toContain("luana.modotte");
    expect(sql).toContain("O seu coração escolhe o lar. Nossa assessoria garante o negócio.");
    expect(sql).toContain("'sobre'");
    expect(sql).toContain("'servicos'");
    expect(sql).toContain("'compra-assistida'");
    expect(sql).toContain("'venda-estrategica'");
    expect(sql).toContain("'analise-documental'");
  });

  it("mounts the project schema and seed into the self-hosted supabase database", () => {
    const compose = readFileSync(
      path.resolve("supabase/docker/docker-compose.yml"),
      "utf8"
    );

    expect(compose).toContain("../migrations/0001_initial.sql");
    expect(compose).toContain("../seeds/0001_initial_seed.sql");
    expect(compose).toContain("/docker-entrypoint-initdb.d/init-scripts/96-project-schema.sql");
    expect(compose).toContain("/docker-entrypoint-initdb.d/init-scripts/97-project-seed.sql");
  });
});
