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

function protectAdminResponse(response: NextResponse): NextResponse {
  return applySensitiveResponseHeaders(applyNoStoreHeaders(response));
}

export async function middleware(request: NextRequest) {
  const {
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
