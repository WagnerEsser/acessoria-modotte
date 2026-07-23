import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  getRequestOrigin,
  hasTrustedMutationOrigin,
} from "@/lib/auth";
import { createSupabaseServerContext } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!hasTrustedMutationOrigin(request)) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "forbidden" }, { status: 403 })
    );
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);
  await supabase.auth.signOut({ scope: "local" });

  const response = NextResponse.redirect(new URL("/admin/login", getRequestOrigin(request)), 303);

  return applyNoStoreHeaders(applyCookies(response));
}
