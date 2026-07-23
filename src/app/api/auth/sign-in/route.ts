import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getAdminFormRequestRejection,
  getRequestOrigin,
  sanitizeAdminRedirect,
} from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import {
  getClientIp,
  hashAuthRateLimitIdentifier,
} from "@/lib/security/request";
import { canAccessAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerContext } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);

  const requestRejection = getAdminFormRequestRejection(request);

  if (requestRejection) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: requestRejection.error },
        { status: requestRejection.status }
      )
    );
  }

  const formData = await request.formData();
  const email = readFormValue(formData, "email");
  const password = readFormValue(formData, "password");
  const redirectTo = sanitizeAdminRedirect(readFormValue(formData, "redirectTo"));

  if (!email || !password) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "missing_credentials"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  if (!hasSupabaseEnv()) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "configuration_missing"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  let authRateLimitIdentifier: string;

  try {
    authRateLimitIdentifier = hashAuthRateLimitIdentifier(
      `${getClientIp(request)}:${email.toLocaleLowerCase("pt-BR")}`
    );
  } catch {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "configuration_missing"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const serviceClient = createSupabaseServiceClient();
  const { data: rateLimitAccepted, error: rateLimitError } = await serviceClient.rpc(
    "consume_security_rate_limit",
    {
      p_identifier_hash: authRateLimitIdentifier,
      p_limit: 8,
      p_window_seconds: 900,
    }
  );

  if (rateLimitError || rateLimitAccepted !== true) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "rate_limited"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "invalid_credentials"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const hasAdminProfile =
    Boolean(user) && !userError && (await canAccessAdmin(supabase));
  if (!hasAdminProfile) {
    await supabase.auth.signOut({ scope: "local" });

    const response = NextResponse.redirect(
      new URL(
        buildAdminLoginUrl(redirectTo, "unauthorized"),
        requestOrigin
      ),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const response = NextResponse.redirect(new URL(redirectTo, requestOrigin), 303);

  return applyNoStoreHeaders(applyCookies(response));
}
