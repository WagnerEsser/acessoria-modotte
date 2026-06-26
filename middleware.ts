import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getRequestOrigin,
  resolveAdminRouteAccess,
} from "@/lib/auth";
import { hasDevAdminSession } from "@/lib/dev-auth";
import { hasSupabaseEnv } from "@/lib/env";
import { canAccessAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerContext } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const hasDevAccess = hasDevAdminSession(request);
  const hasSupabaseAccess =
    !hasDevAccess && hasSupabaseEnv()
      ? Boolean((await supabase.auth.getUser()).data.user) && (await canAccessAdmin(supabase))
      : false;
  const isAllowed = hasDevAccess || hasSupabaseAccess;
  const requestOrigin = getRequestOrigin(request);
  const decision = resolveAdminRouteAccess(
    request.nextUrl.pathname,
    request.nextUrl.searchParams,
    isAllowed
  );

  if (decision.kind === "allow") {
    return applyNoStoreHeaders(applyCookies(NextResponse.next()));
  }

  if (decision.kind === "redirect-login") {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(decision.redirectTo), requestOrigin),
      307
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const response = NextResponse.redirect(new URL(decision.target, requestOrigin), 307);

  return applyNoStoreHeaders(applyCookies(response));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
