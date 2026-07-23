import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

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

const nullableText = (max: number) => z.string().trim().max(max).nullable();
const nullableNumber = (max: number) => z.number().min(0).max(max).nullable();
const propertyFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  transactionType: z.enum(["sale", "rent", "both"]),
  propertyType: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(50),
  neighborhoodName: nullableText(120),
  address: nullableText(250),
  zipCode: nullableText(10).refine(
    (value) => !value || /^\d{8}$/.test(value.replace(/\D/g, "")),
    "invalid_zip_code"
  ),
  price: nullableNumber(1_000_000_000_000),
  priceOnRequest: z.boolean(),
  bedrooms: z.number().int().min(0).max(100),
  bathrooms: z.number().int().min(0).max(100),
  garages: z.number().int().min(0).max(100),
  areaTotal: nullableNumber(10_000_000),
  areaUseful: nullableNumber(10_000_000),
  contactPhone: nullableText(15).refine(
    (value) => !value || /^\d{8,15}$/.test(value),
    "invalid_phone"
  ),
  contactWhatsapp: nullableText(15).refine(
    (value) => !value || /^\d{8,15}$/.test(value),
    "invalid_whatsapp"
  ),
  featured: z.boolean(),
  isPublished: z.boolean(),
  seoTitle: nullableText(120),
  seoDescription: nullableText(320),
  description: nullableText(10_000),
});

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

  const normalizedTransactionType =
    transactionType === "rent" || transactionType === "both" ? transactionType : "sale";
  const parsed = propertyFormSchema.safeParse({
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
    bedrooms: Math.trunc(bedrooms),
    bathrooms: Math.trunc(bathrooms),
    garages: Math.trunc(garages),
    areaTotal,
    areaUseful,
    contactPhone: contactPhone || null,
    contactWhatsapp: contactWhatsapp || null,
    featured: readFormBoolean(formData, "featured"),
    isPublished: readFormBoolean(formData, "is_published"),
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    description: description || null,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: "invalid_fields",
    };
  }

  return {
    ok: true as const,
    data: parsed.data satisfies ParsedPropertyForm,
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
