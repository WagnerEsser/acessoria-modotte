import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  applySensitiveResponseHeaders,
  buildAdminLoginUrl,
  getAdminRequestContext,
  getRequestOrigin,
  isAdminApiPath,
  resolveAdminRouteAccess,
} from "@/lib/auth";
import { getCurrentAdminRole } from "@/lib/admin-authorization";

function isSuperadminOnlyPath(pathname: string) {
  return ["/admin/conteudos", "/admin/usuarios"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function addPermissionToast(response: NextResponse) {
  response.cookies.set(
    "admin-toast",
    encodeURIComponent(JSON.stringify({ type: "error", message: "Você não tem permissão para acessar esta página." })),
    { httpOnly: false, maxAge: 10, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" },
  );
  return response;
}

function protectAdminResponse(response: NextResponse): NextResponse {
  return applySensitiveResponseHeaders(applyNoStoreHeaders(response));
}

export async function middleware(request: NextRequest) {
  const {
    supabase,
    applyCookies,
    isAuthenticated,
    isAuthorized,
  } = await getAdminRequestContext(request);
  const requestOrigin = getRequestOrigin(request);

  if (isAdminApiPath(request.nextUrl.pathname)) {
    if (!isAuthorized) {
      const error = isAuthenticated ? "forbidden" : "unauthorized";
      const response = NextResponse.json(
        { error },
        { status: isAuthenticated ? 403 : 401 }
      );

      return protectAdminResponse(applyCookies(response));
    }

    return protectAdminResponse(applyCookies(NextResponse.next()));
  }

  const decision = resolveAdminRouteAccess(
    request.nextUrl.pathname,
    request.nextUrl.searchParams,
    isAuthorized
  );

  if (
    decision.kind === "allow" &&
    isAuthorized &&
    isSuperadminOnlyPath(request.nextUrl.pathname) &&
    (await getCurrentAdminRole(supabase)) !== "superadmin"
  ) {
    const response = NextResponse.redirect(new URL("/admin/dashboard", requestOrigin), 307);
    return protectAdminResponse(addPermissionToast(applyCookies(response)));
  }

  if (decision.kind === "allow") {
    return protectAdminResponse(applyCookies(NextResponse.next()));
  }

  if (decision.kind === "redirect-login") {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(decision.redirectTo), requestOrigin),
      307
    );

    return protectAdminResponse(applyCookies(response));
  }

  const response = NextResponse.redirect(new URL(decision.target, requestOrigin), 307);

  return protectAdminResponse(applyCookies(response));
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
