import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/env";

describe("supabase env resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the official Docker variable names", () => {
    vi.stubEnv("SUPABASE_URL", "http://kong:8000");
    vi.stubEnv("ANON_KEY", "docker-anon-key");

    expect(hasSupabaseEnv()).toBe(true);
    expect(getSupabaseUrl()).toBe("http://kong:8000");
    expect(getSupabaseAnonKey()).toBe("docker-anon-key");
  });

  it("falls back to the browser public variables", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_INTERNAL_URL", "");
    vi.stubEnv("SUPABASE_PUBLIC_URL", "");
    vi.stubEnv("API_EXTERNAL_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    vi.stubEnv("ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:8000");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");

    expect(hasSupabaseEnv()).toBe(true);
    expect(getSupabaseUrl()).toBe("http://localhost:8000");
    expect(getSupabaseAnonKey()).toBe("public-anon-key");
  });
});
