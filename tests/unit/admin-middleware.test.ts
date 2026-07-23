import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareMocks = vi.hoisted(() => ({
  getAdminRequestContext: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();

  return {
    ...actual,
    getAdminRequestContext: middlewareMocks.getAdminRequestContext,
  };
});

import { config, middleware } from "@/middleware";

function setAuthState(options: {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  hasAdminProfile?: boolean;
}) {
  middlewareMocks.getAdminRequestContext.mockResolvedValue({
    supabase: {},
    applyCookies: (response: NextResponse) => response,
    hasAdminProfile: options.hasAdminProfile ?? options.isAuthorized,
    ...options,
  });
}

describe("admin middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches both administrative pages and APIs", () => {
    expect(config.matcher).toEqual([
      "/admin",
      "/admin/:path*",
      "/api/admin",
      "/api/admin/:path*",
    ]);
  });

  it("returns 401 for an anonymous administrative API request", async () => {
    setAuthState({ isAuthenticated: false, isAuthorized: false });

    const response = await middleware(
      new NextRequest("https://example.com/api/admin/properties", {
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'none'"
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive"
    );
  });

  it("ignores the removed fixed development cookie", async () => {
    setAuthState({ isAuthenticated: false, isAuthorized: false });

    const response = await middleware(
      new NextRequest("https://example.com/admin/dashboard", {
        headers: {
          cookie: "lm-dev-admin-session=1",
        },
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("returns 403 for an authenticated user without the admin role", async () => {
    setAuthState({ isAuthenticated: true, isAuthorized: false });

    const response = await middleware(
      new NextRequest("https://example.com/api/admin/properties", {
        method: "POST",
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "forbidden" });
  });

  it("redirects an anonymous admin page request to a sanitized login URL", async () => {
    setAuthState({ isAuthenticated: false, isAuthorized: false });

    const response = await middleware(
      new NextRequest("https://example.com/admin/imoveis?status=draft")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/login?redirectTo=%2Fadmin%2Fimoveis%3Fstatus%3Ddraft"
    );
  });

  it("allows an active administrator through", async () => {
    setAuthState({ isAuthenticated: true, isAuthorized: true });

    const response = await middleware(
      new NextRequest("https://example.com/api/admin/properties", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("fails closed when the authentication provider is unavailable", async () => {
    middlewareMocks.getAdminRequestContext.mockRejectedValue(
      new Error("authentication unavailable")
    );

    await expect(
      middleware(new NextRequest("https://example.com/admin/dashboard"))
    ).rejects.toThrow("authentication unavailable");
  });
});
