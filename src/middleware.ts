import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_LOGIN_PATH, resolveAdminRouteAccess } from "@/lib/auth";
import { hasDevAdminSession } from "@/lib/dev-auth";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const decision = resolveAdminRouteAccess(pathname, searchParams, hasDevAdminSession(request));

  if (decision.kind === "redirect-login") {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", decision.redirectTo);

    return NextResponse.redirect(loginUrl, 303);
  }

  if (decision.kind === "redirect-target") {
    return NextResponse.redirect(new URL(decision.target, request.url), 303);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
