import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders } from "@/lib/auth";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";

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
  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(readFormValue(formData, "redirect_to"), "/contato");
  const name = readFormValue(formData, "name");
  const email = readFormValue(formData, "email");
  const phone = readFormValue(formData, "phone");
  const source = readFormValue(formData, "source") || "site";
  const pageSlug = readFormValue(formData, "page_slug") || null;
  const interestType = readFormValue(formData, "interest_type") || null;
  const propertySlug = readFormValue(formData, "property_slug") || null;
  const propertyContext = readFormValue(formData, "property_context") || null;
  const website = readFormValue(formData, "website");
  const message = readFormValue(formData, "message");

  if (website) {
    const response = NextResponse.redirect(new URL(`${redirectTo}?submitted=1`, request.url), 303);

    return applyNoStoreHeaders(response);
  }

  if (!name || (!email && !phone)) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=invalid_data`, request.url),
      303
    );

    return applyNoStoreHeaders(response);
  }

  const resolvedPropertyId = propertySlug ? await resolvePropertyIdBySlug(propertySlug) : null;
  const mergedMessageParts = [propertyContext, message].filter(Boolean);

  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from("leads").insert({
    name,
    email: email || null,
    phone: phone || null,
    source,
    interest_type: interestType,
    property_id: resolvedPropertyId,
    page_slug: pageSlug,
    message: mergedMessageParts.length ? mergedMessageParts.join("\n\n") : null,
    status: "new",
  });

  const response = NextResponse.redirect(
    new URL(
      error ? `${redirectTo}?error=save_failed` : `${redirectTo}?submitted=1`,
      request.url
    ),
    303
  );

  return applyNoStoreHeaders(response);
}
