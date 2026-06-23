import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders, buildAdminLoginUrl, sanitizeAdminRedirect } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerContext } from "@/lib/supabase/server";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = readFormValue(formData, "email");
  const password = readFormValue(formData, "password");
  const redirectTo = sanitizeAdminRedirect(readFormValue(formData, "redirectTo"));

  if (!email || !password) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "missing_credentials"), request.url),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "invalid_credentials"), request.url),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const isAllowed = await canAccessAdmin(supabase);

  if (!isAllowed) {
    const { error: bootstrapError } = await supabase.rpc("bootstrap_first_admin");
    const isBootstrapped = !bootstrapError && (await canAccessAdmin(supabase));

    if (isBootstrapped) {
      const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);

      return applyNoStoreHeaders(applyCookies(response));
    }

    await supabase.auth.signOut();

    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "unauthorized"), request.url),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);

  return applyNoStoreHeaders(applyCookies(response));
}
