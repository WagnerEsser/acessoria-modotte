import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("migration contract", () => {
  it("declares the main schema and security primitives", () => {
    const sql = readFileSync(
      path.resolve("supabase/migrations/0001_initial.sql"),
      "utf8"
    );

    expect(sql).toContain("create table if not exists public.properties");
    expect(sql).toContain("create table if not exists public.leads");
    expect(sql).toContain("create table if not exists public.users");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("create policy \"Properties public read\"");
    expect(sql).toContain("create policy \"Users self read or admin\"");
    expect(sql).toContain("create trigger set_updated_at_properties");
  });
});
