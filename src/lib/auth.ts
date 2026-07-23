import type { SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, type NextResponse } from "next/server";

import { canAccessAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerContext } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DEFAULT_PATH = "/admin/dashboard";
export const ADMIN_FORM_MAX_BYTES = 256 * 1024;

export type MutationRequestRejection = {
  error: "forbidden" | "payload_too_large" | "unsupported_media_type";
  status: 403 | 413 | 415;
};

export type AdminRequestContext = {
  supabase: SupabaseClient;
  applyCookies(response: NextResponse): NextResponse;
  isAuthenticated: boolean;
  hasAdminProfile: boolean;
  isAuthorized: boolean;
};

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

export function isAdminApiPath(pathname: string): boolean {
  const normalizedPath = stripTrailingSlash(pathname);

  return normalizedPath === "/api/admin" || normalizedPath.startsWith("/api/admin/");
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

export function getRequestOrigin(
  request: Pick<NextRequest, "nextUrl" | "url">
): string {
  if (process.env.NODE_ENV === "production") {
    return siteUrl;
  }

  return request.nextUrl.origin || new URL(request.url).origin;
}

export function hasTrustedMutationOrigin(
  request: Pick<NextRequest, "headers" | "nextUrl" | "url">
): boolean {
  const originHeader = request.headers.get("origin")?.trim();
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();

  if (!originHeader || originHeader === "null" || fetchSite === "cross-site") {
    return false;
  }

  try {
    return new URL(originHeader).origin === getRequestOrigin(request);
  } catch {
    return false;
  }
}

export function getAdminFormRequestRejection(
  request: Pick<NextRequest, "headers" | "nextUrl" | "url">
): MutationRequestRejection | null {
  if (!hasTrustedMutationOrigin(request)) {
    return { error: "forbidden", status: 403 };
  }

  const contentType = request.headers.get("content-type")?.trim().toLowerCase() ?? "";
  const isSupportedForm = contentType.startsWith(
    "application/x-www-form-urlencoded"
  );

  if (!isSupportedForm) {
    return { error: "unsupported_media_type", status: 415 };
  }

  const contentLength = request.headers.get("content-length")?.trim();

  if (contentLength) {
    const parsedLength = Number(contentLength);

    if (
      !/^\d+$/.test(contentLength) ||
      !Number.isSafeInteger(parsedLength) ||
      parsedLength > ADMIN_FORM_MAX_BYTES
    ) {
      return { error: "payload_too_large", status: 413 };
    }
  }

  return null;
}

export async function getAdminRequestContext(
  request: NextRequest
): Promise<AdminRequestContext> {
  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user) && !error;
  const hasAdminProfile = isAuthenticated ? await canAccessAdmin(supabase) : false;
  const isAuthorized = hasAdminProfile;

  return {
    supabase,
    applyCookies,
    isAuthenticated,
    hasAdminProfile,
    isAuthorized,
  };
}

export function getLoginErrorMessage(error: string | null | undefined): string | null {
  if (!error) {
    return null;
  }

  const messages: Record<string, string> = {
    invalid_request: "A solicitacao nao e valida. Atualize a pagina e tente novamente.",
    rate_limited: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    missing_credentials: "Informe e-mail e senha para continuar.",
    invalid_credentials: "E-mail ou senha inválidos.",
    unauthorized: "Seu usuário não tem acesso ao painel.",
    session_expired: "Sua sessão expirou. Entre novamente.",
    configuration_missing: "O ambiente do Supabase não está configurado neste workspace.",
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
