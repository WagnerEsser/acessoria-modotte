import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import {
  ADMIN_DEFAULT_PATH,
  ADMIN_LOGIN_PATH,
  buildAdminLoginUrl,
  getLoginErrorMessage,
  getRequestOrigin,
  hasTrustedMutationOrigin,
  isAdminApiPath,
  resolveAdminRouteAccess,
  sanitizeAdminRedirect,
} from "@/lib/auth";

describe("admin auth helpers", () => {
  it("sanitizes redirects to admin-only paths", () => {
    expect(sanitizeAdminRedirect("/admin/imoveis?status=draft")).toBe(
      "/admin/imoveis?status=draft"
    );
    expect(sanitizeAdminRedirect("/admin/")).toBe(ADMIN_DEFAULT_PATH);
    expect(sanitizeAdminRedirect("/contato")).toBe(ADMIN_DEFAULT_PATH);
    expect(sanitizeAdminRedirect("https://evil.example.com")).toBe(ADMIN_DEFAULT_PATH);
    expect(sanitizeAdminRedirect("//evil.example.com/admin")).toBe(ADMIN_DEFAULT_PATH);
  });

  it("builds login urls safely", () => {
    expect(buildAdminLoginUrl("/admin/leads?status=new", "unauthorized")).toBe(
      `${ADMIN_LOGIN_PATH}?redirectTo=%2Fadmin%2Fleads%3Fstatus%3Dnew&error=unauthorized`
    );
  });

  it("maps login errors to user-facing messages", () => {
    expect(getLoginErrorMessage("missing_credentials")).toContain("Informe e-mail");
    expect(getLoginErrorMessage("invalid_credentials")).toContain("inválidos");
    expect(getLoginErrorMessage("unauthorized")).toContain("acesso ao painel");
    expect(getLoginErrorMessage("unknown_code")).toContain("Não foi possível");
  });

  it("recognizes administrative API paths without matching lookalikes", () => {
    expect(isAdminApiPath("/api/admin")).toBe(true);
    expect(isAdminApiPath("/api/admin/properties")).toBe(true);
    expect(isAdminApiPath("/api/administrator")).toBe(false);
    expect(isAdminApiPath("/admin/dashboard")).toBe(false);
  });

  it("requires an exact same-origin mutation request", () => {
    const sameOriginRequest = new NextRequest("https://example.com/api/admin/properties", {
      method: "POST",
      headers: {
        origin: "https://example.com",
        "sec-fetch-site": "same-origin",
      },
    });
    const crossOriginRequest = new NextRequest("https://example.com/api/admin/properties", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      },
    });
    const missingOriginRequest = new NextRequest(
      "https://example.com/api/admin/properties",
      { method: "POST" }
    );

    expect(hasTrustedMutationOrigin(sameOriginRequest)).toBe(true);
    expect(hasTrustedMutationOrigin(crossOriginRequest)).toBe(false);
    expect(hasTrustedMutationOrigin(missingOriginRequest)).toBe(false);
  });

  it("does not trust Origin or forwarded host headers when building redirects", () => {
    const request = new NextRequest("https://example.com/admin/login", {
      headers: {
        origin: "https://evil.example",
        "x-forwarded-host": "evil.example",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://example.com");
  });

  it("resolves the admin route access flow", () => {
    const loginPage = resolveAdminRouteAccess(
      ADMIN_LOGIN_PATH,
      new URLSearchParams("redirectTo=%2Fadmin%2Fseo"),
      true
    );

    expect(loginPage).toEqual({
      kind: "redirect-target",
      target: "/admin/seo",
    });

    const protectedPage = resolveAdminRouteAccess(
      "/admin/imoveis",
      new URLSearchParams("status=draft"),
      false
    );

    expect(protectedPage).toEqual({
      kind: "redirect-login",
      redirectTo: "/admin/imoveis?status=draft",
    });

    const allowedLogin = resolveAdminRouteAccess(
      ADMIN_LOGIN_PATH,
      new URLSearchParams(),
      false
    );

    expect(allowedLogin).toEqual({ kind: "allow" });
  });
});
