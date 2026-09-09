import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getAdminFormRequestRejection,
  getAdminRequestContext,
  getRequestOrigin,
} from "@/lib/auth";
import { parsePropertyFormData, upsertNeighborhoodForProperty } from "@/lib/admin-property-form";
import {
  getPropertyImageFiles,
  getPropertyVideoFiles,
  syncPropertyFeatures,
  uploadPropertyImages,
  uploadPropertyVideos,
  deletePropertyImages,
  deletePropertyVideos,
  validatePropertyImageFiles,
  validatePropertyVideoFiles,
} from "@/lib/admin-property-media";
import { readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";

export async function POST(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  const requestRejection = getAdminFormRequestRejection(request);

  if (requestRejection) {
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: requestRejection.error },
        { status: requestRejection.status }
      )
    );
  }

  const { supabase, applyCookies, isAuthorized } =
    await getAdminRequestContext(request);

  if (!isAuthorized) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Sua sessão expirou. Entre novamente." }, { status: 401 }));
    }
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl("/admin/imoveis", "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/imoveis"
  );

  const parsed = parsePropertyFormData(formData);

  if (!parsed.ok) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: "Revise os campos obrigatórios do imóvel.", fieldErrors: parsed.fieldErrors }, { status: 400 }));
    }
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=missing_required_fields`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const imageFiles = getPropertyImageFiles(formData);
  const videoFiles = getPropertyVideoFiles(formData);
  const imageError = await validatePropertyImageFiles(imageFiles);

  if (imageError) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: imageError, fieldErrors: { images: imageError } }, { status: 400 }));
    }
    const response = NextResponse.redirect(new URL(`${redirectTo}?error=invalid_images`, requestOrigin), 303);
    return applyNoStoreHeaders(applyCookies(response));
  }

  const videoError = await validatePropertyVideoFiles(videoFiles);

  if (videoError) {
    if (wantsJson) {
      return applyNoStoreHeaders(NextResponse.json({ status: "error", message: videoError, fieldErrors: { videos: videoError } }, { status: 400 }));
    }
    const response = NextResponse.redirect(new URL(`${redirectTo}?error=invalid_videos`, requestOrigin), 303);
    return applyNoStoreHeaders(applyCookies(response));
  }

  const neighborhoodId = await upsertNeighborhoodForProperty(
    supabase,
    parsed.data.neighborhoodName,
    parsed.data.city,
    parsed.data.state
  );
  const publishedAt = parsed.data.isPublished ? new Date().toISOString() : null;
  const { data: createdProperty, error } = await supabase.from("properties").insert({
    slug: parsed.data.slug,
    title: parsed.data.title,
    transaction_type: parsed.data.transactionType,
    property_type: parsed.data.propertyType,
    status: parsed.data.isPublished ? parsed.data.status : "draft",
    is_published: parsed.data.isPublished,
    featured: parsed.data.featured,
    price: parsed.data.price,
    price_on_request: parsed.data.priceOnRequest,
    description: parsed.data.description,
    address: parsed.data.address,
    show_full_address: parsed.data.showFullAddress,
    neighborhood_id: neighborhoodId,
    city: parsed.data.city,
    state: parsed.data.state,
    zip_code: parsed.data.zipCode,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    garages: parsed.data.garages,
    area_total: parsed.data.areaTotal,
    area_useful: parsed.data.areaUseful,
    condominium_fee: parsed.data.condominiumFee,
    iptu_value: parsed.data.iptuValue,
    built_year: parsed.data.builtYear,
    furnished: parsed.data.furnished,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    contact_phone: parsed.data.contactPhone,
    contact_whatsapp: parsed.data.contactWhatsapp,
    seo_title: parsed.data.seoTitle,
    seo_description: parsed.data.seoDescription,
    published_at: publishedAt,
    sort_order: 0,
  }).select("id").single();

  let saveError: { message: string } | null = error ? { message: error.message } : null;

  if (!saveError && createdProperty) {
    try {
      await syncPropertyFeatures(supabase, createdProperty.id, parsed.data.features);
      await uploadPropertyImages(supabase, createdProperty.id, parsed.data.title, imageFiles, 0);
      await uploadPropertyVideos(supabase, createdProperty.id, videoFiles, 0);
    } catch {
      const { data: imageRows } = await supabase.from("property_images").select("id").eq("property_id", createdProperty.id);
      const { data: videoRows } = await supabase.from("property_videos").select("id").eq("property_id", createdProperty.id);
      await deletePropertyImages(supabase, createdProperty.id, (imageRows ?? []).map((row) => row.id));
      await deletePropertyVideos(supabase, createdProperty.id, (videoRows ?? []).map((row) => row.id));
      await supabase.from("properties").delete().eq("id", createdProperty.id);
      saveError = { message: "property_media_save_failed" };
    }
  }

  const response = NextResponse.redirect(
    new URL(
      saveError ? `${redirectTo}?error=save_failed` : `${redirectTo}?status=created`,
      requestOrigin
    ),
    303
  );

  if (wantsJson) {
    return applyNoStoreHeaders(NextResponse.json({ status: saveError ? "error" : "success", message: saveError ? "Não foi possível salvar o imóvel." : "Imóvel salvo com sucesso.", redirect: saveError ? undefined : "/admin/imoveis" }, { status: saveError ? 500 : 200 }));
  }

  return applyNoStoreHeaders(applyCookies(response));
}
