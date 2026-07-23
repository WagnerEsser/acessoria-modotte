import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiAuthMocks = vi.hoisted(() => ({
  getAdminRequestContext: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();

  return {
    ...actual,
    getAdminRequestContext: apiAuthMocks.getAdminRequestContext,
  };
});

import { POST as createProperty } from "@/app/api/admin/properties/route";

function createRequest(
  origin: string,
  extraHeaders: Record<string, string> = {}
) {
  const body = new URLSearchParams();

  return new NextRequest("https://example.com/api/admin/properties", {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site":
        origin === "https://example.com" ? "same-origin" : "cross-site",
      ...extraHeaders,
    },
    body,
  });
}

describe("admin API defense in depth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiAuthMocks.getAdminRequestContext.mockResolvedValue({
      supabase: {},
      applyCookies: (response: NextResponse) => response,
      isAuthenticated: false,
      isAuthorized: false,
    });
  });

  it("rejects cross-origin mutation before reading the body or database", async () => {
    const response = await createProperty(createRequest("https://evil.example"));

    expect(response.status).toBe(403);
    expect(apiAuthMocks.getAdminRequestContext).not.toHaveBeenCalled();
  });

  it("revalidates authorization inside the route even if middleware is bypassed", async () => {
    const response = await createProperty(createRequest("https://example.com"));

    expect(apiAuthMocks.getAdminRequestContext).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/admin/login");
    expect(response.headers.get("location")).toContain("session_expired");
  });

  it("rejects an oversized declared form payload before authentication", async () => {
    const response = await createProperty(
      createRequest("https://example.com", {
        "content-length": String(256 * 1024 + 1),
      })
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "payload_too_large",
    });
    expect(apiAuthMocks.getAdminRequestContext).not.toHaveBeenCalled();
  });

  it("rejects non-form content types", async () => {
    const response = await createProperty(
      createRequest("https://example.com", {
        "content-type": "application/json",
      })
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      error: "unsupported_media_type",
    });
    expect(apiAuthMocks.getAdminRequestContext).not.toHaveBeenCalled();
  });
});
