import type { NextResponse } from "next/server";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DEFAULT_PATH = "/admin/dashboard";

type AdminRouteDecision =
  | { kind: "allow" }
  | { kind: "redirect-login"; redirectTo: string }
  | { kind: "redirect-target"; target: string };

function stripTrailingSlash(pathname: string): string {
  if (pathname.length <= 1) {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function isAdminPath(pathname: string): boolean {
  const normalizedPath = stripTrailingSlash(pathname);

  return normalizedPath === "/admin" || normalizedPath.startsWith("/admin/");
}

export function sanitizeAdminRedirect(
  target: string | null | undefined,
  fallback = ADMIN_DEFAULT_PATH
): string {
  if (!target) {
    return fallback;
  }

  const trimmedTarget = target.trim();

  if (!trimmedTarget || trimmedTarget.startsWith("//")) {
    return fallback;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedTarget)) {
    return fallback;
  }

  try {
    const url = new URL(trimmedTarget, "http://auth.local");
    const pathname = stripTrailingSlash(url.pathname);

    if (pathname === "/admin") {
      return ADMIN_DEFAULT_PATH;
    }

    if (!isAdminPath(pathname) || pathname === ADMIN_LOGIN_PATH) {
      return fallback;
    }

    return `${pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function buildAdminLoginUrl(
  redirectTo?: string | null,
  error?: string | null
): string {
  const url = new URL(ADMIN_LOGIN_PATH, "http://auth.local");
  const safeRedirectTo = sanitizeAdminRedirect(redirectTo);

  if (safeRedirectTo) {
    url.searchParams.set("redirectTo", safeRedirectTo);
  }

  if (error) {
    url.searchParams.set("error", error);
  }

  return `${url.pathname}${url.search}`;
}

export function getLoginErrorMessage(error: string | null | undefined): string | null {
  if (!error) {
    return null;
  }

  const messages: Record<string, string> = {
    missing_credentials: "Informe e-mail e senha para continuar.",
    invalid_credentials: "E-mail ou senha inválidos.",
    unauthorized: "Seu usuário não tem acesso ao painel.",
    session_expired: "Sua sessão expirou. Entre novamente.",
  };

  return messages[error] ?? "Não foi possível entrar. Tente novamente.";
}

function buildProtectedRedirectTarget(
  pathname: string,
  searchParams: URLSearchParams
): string {
  const normalizedPath = stripTrailingSlash(pathname);
  const targetPath = normalizedPath === "/admin" ? ADMIN_DEFAULT_PATH : normalizedPath;
  const query = searchParams.toString();

  return sanitizeAdminRedirect(query ? `${targetPath}?${query}` : targetPath);
}

export function resolveAdminRouteAccess(
  pathname: string,
  searchParams: URLSearchParams,
  canAccessAdmin: boolean
): AdminRouteDecision {
  const normalizedPath = stripTrailingSlash(pathname);

  if (normalizedPath === ADMIN_LOGIN_PATH) {
    if (!canAccessAdmin) {
      return { kind: "allow" };
    }

    return {
      kind: "redirect-target",
      target: sanitizeAdminRedirect(searchParams.get("redirectTo")),
    };
  }

  if (!isAdminPath(normalizedPath)) {
    return { kind: "allow" };
  }

  if (!canAccessAdmin) {
    return {
      kind: "redirect-login",
      redirectTo: buildProtectedRedirectTarget(normalizedPath, searchParams),
    };
  }

  return { kind: "allow" };
}

export function applyNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
