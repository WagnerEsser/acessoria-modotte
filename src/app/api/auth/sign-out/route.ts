import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders } from "@/lib/auth";
import { clearDevAdminSession } from "@/lib/dev-auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerContext } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
    clearDevAdminSession(response);

    return applyNoStoreHeaders(response);
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);

  return applyNoStoreHeaders(applyCookies(response));
}
