import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(),
  canAccessAdmin: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  rateLimitRpc: vi.fn(),
  applyCookies: vi.fn((response: NextResponse) => {
    response.headers.set("x-auth-cookies-applied", "1");
    return response;
  }),
}));

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();

  return {
    ...actual,
    hasSupabaseEnv: authMocks.hasSupabaseEnv,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  canAccessAdmin: authMocks.canAccessAdmin,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerContext: () => ({
    supabase: {
      auth: {
        getUser: authMocks.getUser,
        signInWithPassword: authMocks.signInWithPassword,
        signOut: authMocks.signOut,
      },
    },
    applyCookies: authMocks.applyCookies,
  }),
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: () => ({
    rpc: authMocks.rateLimitRpc,
  }),
}));

import AdminLoginPage from "@/app/(admin)/admin/(auth)/login/page";
import { POST as signIn } from "@/app/api/auth/sign-in/route";
import { POST as signOut } from "@/app/api/auth/sign-out/route";
import { getAdminRequestContext } from "@/lib/auth";

function createSignInRequest(options?: {
  origin?: string;
  redirectTo?: string;
}): NextRequest {
  const formData = new URLSearchParams();
  formData.set("email", "admin@example.com");
  formData.set("password", "test-password");
  formData.set("redirectTo", options?.redirectTo ?? "/admin/dashboard");

  return new NextRequest("https://example.com/api/auth/sign-in", {
    method: "POST",
    headers: options?.origin
      ? {
          origin: options.origin,
          "sec-fetch-site":
            options.origin === "https://example.com" ? "same-origin" : "cross-site",
        }
      : undefined,
    body: formData,
  });
}

describe("Supabase admin auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.hasSupabaseEnv.mockReturnValue(true);
    authMocks.signInWithPassword.mockResolvedValue({ error: null });
    authMocks.signOut.mockResolvedValue({ error: null });
    authMocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-user" } },
      error: null,
    });
    authMocks.canAccessAdmin.mockResolvedValue(true);
    authMocks.rateLimitRpc.mockResolvedValue({ data: true, error: null });
    vi.stubEnv(
      "AUTH_RATE_LIMIT_SECRET",
      "a-secure-auth-test-secret-with-more-than-32-characters"
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not render configured credentials into the login HTML", async () => {
    vi.stubEnv("ADMIN_LOGIN_EMAIL", "should-not-render@example.com");
    vi.stubEnv("ADMIN_LOGIN_PASSWORD", "should-not-render-password");

    const markup = renderToStaticMarkup(
      await AdminLoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(markup).not.toContain("should-not-render@example.com");
    expect(markup).not.toContain("should-not-render-password");
  });

  it("requires both a verified user and an active admin profile", async () => {
    authMocks.canAccessAdmin.mockResolvedValue(false);

    const context = await getAdminRequestContext(
      new NextRequest("https://example.com/admin/dashboard")
    );

    expect(authMocks.getUser).toHaveBeenCalledOnce();
    expect(authMocks.canAccessAdmin).toHaveBeenCalledOnce();
    expect(context.isAuthenticated).toBe(true);
    expect(context.isAuthorized).toBe(false);
  });

  it("does not query roles for an anonymous or invalid session", async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid session"),
    });

    const context = await getAdminRequestContext(
      new NextRequest("https://example.com/admin/dashboard")
    );

    expect(authMocks.canAccessAdmin).not.toHaveBeenCalled();
    expect(context.isAuthenticated).toBe(false);
    expect(context.isAuthorized).toBe(false);
  });

  it("rejects login CSRF before calling Supabase Auth", async () => {
    const response = await signIn(createSignInRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "forbidden" });
    expect(authMocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("uses Supabase Auth and returns a generic error for invalid credentials", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      error: new Error("provider detail must not leak"),
    });

    const response = await signIn(
      createSignInRequest({ origin: "https://example.com" })
    );

    expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "test-password",
    });
    expect(authMocks.getUser).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("error=invalid_credentials");
    expect(response.headers.get("location")).not.toContain("provider");
  });

  it("rate limits authentication attempts before checking credentials", async () => {
    authMocks.rateLimitRpc.mockResolvedValue({ data: false, error: null });

    const response = await signIn(
      createSignInRequest({ origin: "https://example.com" })
    );

    expect(authMocks.signInWithPassword).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toContain("error=rate_limited");
  });

  it("signs out an authenticated user who is not an active admin", async () => {
    authMocks.canAccessAdmin.mockResolvedValue(false);

    const response = await signIn(
      createSignInRequest({ origin: "https://example.com" })
    );

    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(authMocks.getUser).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toContain("error=unauthorized");
  });

  it("applies Supabase session cookies and honors only safe admin redirects", async () => {
    const response = await signIn(
      createSignInRequest({
        origin: "https://example.com",
        redirectTo: "https://evil.example",
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/dashboard"
    );
    expect(authMocks.getUser).toHaveBeenCalledOnce();
    expect(response.headers.get("x-auth-cookies-applied")).toBe("1");
  });

  it("requires same-origin logout and revokes the Supabase session", async () => {
    const blockedResponse = await signOut(
      new NextRequest("https://example.com/api/auth/sign-out", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          "sec-fetch-site": "cross-site",
        },
      })
    );

    expect(blockedResponse.status).toBe(403);
    expect(authMocks.signOut).not.toHaveBeenCalled();

    const response = await signOut(
      new NextRequest("https://example.com/api/auth/sign-out", {
        method: "POST",
        headers: {
          origin: "https://example.com",
          "sec-fetch-site": "same-origin",
        },
      })
    );

    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/login"
    );
    expect(response.headers.get("x-auth-cookies-applied")).toBe("1");
  });
});
