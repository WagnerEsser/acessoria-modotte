import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders } from "@/lib/auth";
import { sanitizeInternalRedirect } from "@/lib/form-utils";
import { parseLeadSubmission } from "@/lib/lead-submission";
import {
  getClientIp,
  getTrustedRedirectOrigin,
  hashRateLimitIdentifier,
  isTrustedMutationOrigin,
  readLimitedUrlEncodedForm,
} from "@/lib/security/request";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function redirectWithStatus(
  request: NextRequest,
  redirectTo: string,
  status: "submitted=1" | `error=${string}`,
  fieldErrors: Record<string, string> = {},
) {
  if (request.headers.get("accept")?.includes("application/json")) {
    const messages: Record<string, string> = {
      "submitted=1": "Mensagem enviada com sucesso. A equipe vai retornar em breve.",
      "error=invalid_data": "Revise os campos do formulário.",
      "error=configuration": "Não foi possível processar o formulário agora.",
      "error=rate_limited": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      "error=verification_failed": "Não foi possível confirmar o envio. Tente novamente.",
      "error=save_failed": "Não foi possível enviar o formulário. Tente novamente.",
    };
    const isError = status.startsWith("error=");

    return applyNoStoreHeaders(
      NextResponse.json(
        { status: isError ? "error" : "success", message: messages[status], fieldErrors },
        { status: isError ? 400 : 200 },
      ),
    );
  }

  const separator = redirectTo.includes("?") ? "&" : "?";
  const response = NextResponse.redirect(
    new URL(`${redirectTo}${separator}${status}`, getTrustedRedirectOrigin(request)),
    303
  );

  return applyNoStoreHeaders(response);
}

async function resolvePropertyIdBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return data?.id ?? null;
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return applyNoStoreHeaders(
      NextResponse.json({ error: "forbidden_origin" }, { status: 403 })
    );
  }

  let params: URLSearchParams;

  try {
    params = await readLimitedUrlEncodedForm(request);
  } catch (error) {
    const status = error instanceof Error && error.message === "payload_too_large" ? 413 : 415;

    return applyNoStoreHeaders(NextResponse.json({ error: "invalid_request" }, { status }));
  }

  const redirectTo = sanitizeInternalRedirect(params.get("redirect_to"), "/contato");
  const parsed = parseLeadSubmission(params);

  if (!parsed.success) {
    const fieldNames: Record<string, string> = {
      name: "name",
      email: "email",
      phone: "phone",
      interestType: "interest_type",
      propertyContext: "property_context",
      message: "message",
    };
    const fieldErrors = Object.fromEntries(
      parsed.error.issues
        .filter((issue) => typeof issue.path[0] === "string")
        .map((issue) => [fieldNames[String(issue.path[0])] ?? String(issue.path[0]), "Revise este campo."]),
    );

    return redirectWithStatus(request, redirectTo, "error=invalid_data", fieldErrors);
  }

  if (parsed.data.website) {
    return redirectWithStatus(request, redirectTo, "submitted=1");
  }

  const clientIp = getClientIp(request);
  let identifierHash: string;

  try {
    identifierHash = hashRateLimitIdentifier(clientIp);
  } catch {
    return redirectWithStatus(request, redirectTo, "error=configuration");
  }

  const serviceClient = createSupabaseServiceClient();
  const { data: rateLimitAccepted, error: rateLimitError } = await serviceClient.rpc(
    "consume_security_rate_limit",
    {
      p_identifier_hash: identifierHash,
      p_limit: 5,
      p_window_seconds: 600,
    }
  );

  if (rateLimitError || rateLimitAccepted !== true) {
    return redirectWithStatus(request, redirectTo, "error=rate_limited");
  }

  if (!(await verifyTurnstileToken(parsed.data.turnstileToken, clientIp))) {
    return redirectWithStatus(request, redirectTo, "error=verification_failed");
  }

  const resolvedPropertyId = await resolvePropertyIdBySlug(parsed.data.propertySlug);
  const mergedMessageParts = [
    parsed.data.propertyContext,
    parsed.data.message,
  ].filter(Boolean);
  const { error } = await serviceClient.from("leads").insert({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    source: parsed.data.source,
    interest_type: parsed.data.interestType || null,
    property_id: resolvedPropertyId,
    page_slug: parsed.data.pageSlug || null,
    message: mergedMessageParts.length ? mergedMessageParts.join("\n\n") : null,
    status: "new",
  });

  return redirectWithStatus(
    request,
    redirectTo,
    error ? "error=save_failed" : "submitted=1"
  );
}
