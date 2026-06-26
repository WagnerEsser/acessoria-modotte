import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_DEFAULT_PATH,
  ADMIN_LOGIN_PATH,
  buildAdminLoginUrl,
  getLoginErrorMessage,
  resolveAdminRouteAccess,
  sanitizeAdminRedirect,
} from "@/lib/auth";
import { getAdminLoginEmail, getAdminLoginPassword } from "@/lib/env";

describe("admin auth helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sanitizes redirects to admin-only paths", () => {
    expect(sanitizeAdminRedirect("/admin/imoveis?status=draft")).toBe(
      "/admin/imoveis?status=draft"
    );
    expect(sanitizeAdminRedirect("/admin/")).toBe(ADMIN_DEFAULT_PATH);
    expect(sanitizeAdminRedirect("/contato")).toBe(ADMIN_DEFAULT_PATH);
    expect(sanitizeAdminRedirect("https://evil.example.com")).toBe(ADMIN_DEFAULT_PATH);
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

  it("reads the admin credentials from env", () => {
    vi.stubEnv("ADMIN_LOGIN_EMAIL", "teste@luanamodotte.local");
    vi.stubEnv("ADMIN_LOGIN_PASSWORD", "Teste@1234");

    expect(getAdminLoginEmail()).toBe("teste@luanamodotte.local");
    expect(getAdminLoginPassword()).toBe("Teste@1234");
  });
});
