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

function loginResponse(
  request: NextRequest,
  redirectTo: string,
  error: string | null,
  applyCookies?: (response: NextResponse) => NextResponse,
) {
  const messages: Record<string, string> = {
    missing_credentials: "Informe e-mail e senha para continuar.",
    configuration_missing: "O ambiente de acesso não está configurado.",
    rate_limited: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    invalid_credentials: "E-mail ou senha inválidos.",
    unauthorized: "Seu usuário não tem acesso ao painel.",
  };
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  if (wantsJson) {
    const fieldErrors = error === "missing_credentials"
      ? { email: "Informe o e-mail.", password: "Informe a senha." }
      : {};
    const response = NextResponse.json(
      error
        ? { status: "error", message: messages[error] ?? "Não foi possível entrar.", fieldErrors }
        : { status: "success", message: "Login realizado com sucesso.", redirect: redirectTo },
      { status: error ? 401 : 200 },
    );

    return applyNoStoreHeaders(applyCookies ? applyCookies(response) : response);
  }

  const response = NextResponse.redirect(
    new URL(
      error
        ? buildAdminLoginUrl(redirectTo, error)
        : redirectTo,
      getRequestOrigin(request),
    ),
    303,
  );

  return applyNoStoreHeaders(applyCookies ? applyCookies(response) : response);
}

export async function POST(request: NextRequest) {
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
    return loginResponse(request, redirectTo, "missing_credentials");
  }

  if (!hasSupabaseEnv()) {
    return loginResponse(request, redirectTo, "configuration_missing");
  }

  let authRateLimitIdentifier: string;

  try {
    authRateLimitIdentifier = hashAuthRateLimitIdentifier(
      `${getClientIp(request)}:${email.toLocaleLowerCase("pt-BR")}`
    );
  } catch {
    return loginResponse(request, redirectTo, "configuration_missing");
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
    return loginResponse(request, redirectTo, "rate_limited");
  }

  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return loginResponse(request, redirectTo, "invalid_credentials", applyCookies);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const hasAdminProfile =
    Boolean(user) && !userError && (await canAccessAdmin(supabase));
  if (!hasAdminProfile) {
    await supabase.auth.signOut({ scope: "local" });

    return loginResponse(request, redirectTo, "unauthorized", applyCookies);
  }

  return loginResponse(request, redirectTo, null, applyCookies);
}
