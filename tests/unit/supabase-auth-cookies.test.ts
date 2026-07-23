import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseAuthCookieOptions } from "@/lib/supabase/server";

describe("Supabase auth cookie options", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses HttpOnly same-site cookies scoped to the whole application", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(getSupabaseAuthCookieOptions()).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  });

  it("requires HTTPS cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(getSupabaseAuthCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  });
});
