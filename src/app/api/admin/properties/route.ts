import { NextResponse, type NextRequest } from "next/server";

import { applyNoStoreHeaders, buildAdminLoginUrl, getRequestOrigin } from "@/lib/auth";
import { hasDevAdminSession } from "@/lib/dev-auth";
import { parsePropertyFormData, upsertNeighborhoodForProperty } from "@/lib/admin-property-form";
import { readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";
import { createSupabaseServerContext } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/imoveis"
  );
  const { supabase, applyCookies } = createSupabaseServerContext(request);
  const requestOrigin = getRequestOrigin(request);

  const hasAccess = hasDevAdminSession(request);

  if (!hasAccess) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl(redirectTo, "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const parsed = parsePropertyFormData(formData);

  if (!parsed.ok) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=missing_required_fields`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const neighborhoodId = await upsertNeighborhoodForProperty(
    supabase,
    parsed.data.neighborhoodName,
    parsed.data.city,
    parsed.data.state
  );
  const publishedAt = parsed.data.isPublished ? new Date().toISOString() : null;
  const { error } = await supabase.from("properties").insert({
    slug: parsed.data.slug,
    title: parsed.data.title,
    transaction_type: parsed.data.transactionType,
    property_type: parsed.data.propertyType,
    status: parsed.data.isPublished ? "published" : "draft",
    is_published: parsed.data.isPublished,
    featured: parsed.data.featured,
    price: parsed.data.price,
    price_on_request: parsed.data.priceOnRequest,
    description: parsed.data.description,
    address: parsed.data.address,
    neighborhood_id: neighborhoodId,
    city: parsed.data.city,
    state: parsed.data.state,
    zip_code: parsed.data.zipCode,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    garages: parsed.data.garages,
    area_total: parsed.data.areaTotal,
    area_useful: parsed.data.areaUseful,
    contact_phone: parsed.data.contactPhone,
    contact_whatsapp: parsed.data.contactWhatsapp,
    seo_title: parsed.data.seoTitle,
    seo_description: parsed.data.seoDescription,
    published_at: publishedAt,
    sort_order: 0,
  });

  const response = NextResponse.redirect(
    new URL(
      error ? `${redirectTo}?error=save_failed` : `${redirectTo}?status=created`,
      requestOrigin
    ),
    303
  );

  return applyNoStoreHeaders(applyCookies(response));
}
