import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  resolveAdminRouteAccess,
} from "@/lib/auth";
import { canAccessAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerContext } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAllowed = user ? await canAccessAdmin(supabase) : false;
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
      new URL(buildAdminLoginUrl(decision.redirectTo), request.url),
      307
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const response = NextResponse.redirect(new URL(decision.target, request.url), 307);

  return applyNoStoreHeaders(applyCookies(response));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
