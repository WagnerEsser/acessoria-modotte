import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizePhoneDigits } from "@/lib/contact";
import { parseNumberField, readFormBoolean, readFormValue, slugify } from "@/lib/form-utils";

export type ParsedPropertyForm = {
  title: string;
  slug: string;
  transactionType: "sale" | "rent" | "both";
  propertyType: string;
  city: string;
  state: string;
  neighborhoodName: string | null;
  address: string | null;
  zipCode: string | null;
  price: number | null;
  priceOnRequest: boolean;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  areaTotal: number | null;
  areaUseful: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  featured: boolean;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  description: string | null;
};

export function parsePropertyFormData(formData: FormData) {
  const title = readFormValue(formData, "title");
  const rawSlug = readFormValue(formData, "slug");
  const transactionType = readFormValue(formData, "transaction_type");
  const propertyType = readFormValue(formData, "property_type");
  const city = readFormValue(formData, "city");
  const state = readFormValue(formData, "state");
  const neighborhoodName = readFormValue(formData, "neighborhood_name");
  const address = readFormValue(formData, "address");
  const zipCode = readFormValue(formData, "zip_code");
  const price = parseNumberField(readFormValue(formData, "price"));
  const bedrooms = parseNumberField(readFormValue(formData, "bedrooms")) ?? 0;
  const bathrooms = parseNumberField(readFormValue(formData, "bathrooms")) ?? 0;
  const garages = parseNumberField(readFormValue(formData, "garages")) ?? 0;
  const areaTotal = parseNumberField(readFormValue(formData, "area_total"));
  const areaUseful = parseNumberField(readFormValue(formData, "area_useful"));
  const contactPhone = normalizePhoneDigits(readFormValue(formData, "contact_phone"));
  const contactWhatsapp = normalizePhoneDigits(readFormValue(formData, "contact_whatsapp"));
  const seoTitle = readFormValue(formData, "seo_title");
  const seoDescription = readFormValue(formData, "seo_description");
  const description = readFormValue(formData, "description");

  if (!title || !propertyType || !city || !state) {
    return {
      ok: false as const,
      error: "missing_required_fields",
    };
  }

  const normalizedTransactionType =
    transactionType === "rent" || transactionType === "both" ? transactionType : "sale";

  return {
    ok: true as const,
    data: {
      title,
      slug: rawSlug || slugify(title),
      transactionType: normalizedTransactionType,
      propertyType,
      city,
      state,
      neighborhoodName: neighborhoodName || null,
      address: address || null,
      zipCode: zipCode || null,
      price,
      priceOnRequest: readFormBoolean(formData, "price_on_request"),
      bedrooms: Math.max(0, Math.trunc(bedrooms)),
      bathrooms: Math.max(0, Math.trunc(bathrooms)),
      garages: Math.max(0, Math.trunc(garages)),
      areaTotal,
      areaUseful,
      contactPhone: contactPhone || null,
      contactWhatsapp: contactWhatsapp || null,
      featured: readFormBoolean(formData, "featured"),
      isPublished: readFormBoolean(formData, "is_published"),
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      description: description || null,
    } satisfies ParsedPropertyForm,
  };
}

export async function upsertNeighborhoodForProperty(
  supabase: SupabaseClient,
  neighborhoodName: string | null,
  city: string,
  state: string | null
) {
  if (!neighborhoodName) {
    return null;
  }

  const slug = slugify(neighborhoodName);
  const { data, error } = await supabase
    .from("neighborhoods")
    .upsert(
      {
      slug,
        name: neighborhoodName,
        city,
        state,
        is_published: true,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}
