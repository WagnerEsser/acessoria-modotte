import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyNoStoreHeaders,
  buildAdminLoginUrl,
  getAdminFormRequestRejection,
  getAdminRequestContext,
  getRequestOrigin,
} from "@/lib/auth";
import { brand } from "@/lib/brand";
import { normalizePhoneDigits } from "@/lib/contact";
import { readFormValue, sanitizeInternalRedirect } from "@/lib/form-utils";

type SiteSettingsRecord = {
  company_name: string | null;
  brand_name: string | null;
  legal_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  primary_phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  social_links: Record<string, string> | null;
  opening_hours: unknown[] | null;
  impact_phrase: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
};

const siteSettingsInputSchema = z.object({
  whatsappNumber: z
    .string()
    .max(15)
    .refine((value) => !value || /^\d{8,15}$/.test(value)),
  primaryPhone: z
    .string()
    .max(15)
    .refine((value) => !value || /^\d{8,15}$/.test(value)),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((value) => !value || z.string().email().safeParse(value).success),
  impactPhrase: z.string().trim().min(2).max(500),
  instagram: z.string().trim().max(200),
});

function normalizeInstagramProfile(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);

      if (
        url.protocol !== "https:" ||
        (url.hostname !== "instagram.com" && url.hostname !== "www.instagram.com")
      ) {
        return null;
      }

      return url.toString().replace(/\/+$/, "");
    } catch {
      return null;
    }
  }

  const normalizedHandle = trimmed
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .trim();

  return normalizedHandle ? `https://instagram.com/${normalizedHandle}` : null;
}

function mergeSocialLinks(
  currentLinks: Record<string, string> | null | undefined,
  instagramProfile: string | null
) {
  const nextLinks = { ...(currentLinks ?? {}) };

  if (instagramProfile) {
    nextLinks.instagram = instagramProfile;
  } else {
    delete nextLinks.instagram;
  }

  return nextLinks;
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

  const { supabase, applyCookies, isAuthorized } =
    await getAdminRequestContext(request);

  if (!isAuthorized) {
    const response = NextResponse.redirect(
      new URL(buildAdminLoginUrl("/admin/conteudos", "session_expired"), requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const formData = await request.formData();
  const redirectTo = sanitizeInternalRedirect(
    readFormValue(formData, "redirect_to"),
    "/admin/conteudos"
  );
  const parsed = siteSettingsInputSchema.safeParse({
    whatsappNumber: normalizePhoneDigits(readFormValue(formData, "whatsapp_number")),
    primaryPhone: normalizePhoneDigits(readFormValue(formData, "primary_phone")),
    email: readFormValue(formData, "email"),
    impactPhrase: readFormValue(formData, "impact_phrase") || brand.slogan,
    instagram: readFormValue(formData, "instagram"),
  });

  if (!parsed.success) {
    const response = NextResponse.redirect(
      new URL(`${redirectTo}?error=invalid_data`, requestOrigin),
      303
    );

    return applyNoStoreHeaders(applyCookies(response));
  }

  const whatsappNumber = parsed.data.whatsappNumber || null;
  const primaryPhone = parsed.data.primaryPhone || null;
  const email = parsed.data.email || null;
  const impactPhrase = parsed.data.impactPhrase;
  const instagramProfile = normalizeInstagramProfile(parsed.data.instagram);

  const { data: existingSettings } = await supabase
    .from("site_settings")
    .select(
      "company_name, brand_name, legal_name, logo_url, primary_color, secondary_color, accent_color, primary_phone, whatsapp_number, email, address, city, state, social_links, opening_hours, impact_phrase, default_seo_title, default_seo_description"
    )
    .eq("singleton_key", "main")
    .maybeSingle();

  const settings = (existingSettings as SiteSettingsRecord | null) ?? null;

  const { error } = await supabase.from("site_settings").upsert(
    {
      singleton_key: "main",
      company_name: settings?.company_name ?? brand.name,
      brand_name: settings?.brand_name ?? brand.name,
      legal_name: settings?.legal_name ?? null,
      logo_url: settings?.logo_url ?? null,
      primary_color: settings?.primary_color ?? null,
      secondary_color: settings?.secondary_color ?? null,
      accent_color: settings?.accent_color ?? null,
      primary_phone: primaryPhone,
      whatsapp_number: whatsappNumber,
      email,
      address: settings?.address ?? null,
      city: settings?.city ?? null,
      state: settings?.state ?? null,
      social_links: mergeSocialLinks(settings?.social_links, instagramProfile),
      opening_hours: settings?.opening_hours ?? [],
      impact_phrase: impactPhrase,
      default_seo_title: settings?.default_seo_title ?? `${brand.name} | ${brand.subtitle}`,
      default_seo_description: settings?.default_seo_description ?? impactPhrase,
    },
    { onConflict: "singleton_key" }
  );

  const response = NextResponse.redirect(
    new URL(error ? `${redirectTo}?error=save_failed` : `${redirectTo}?status=updated`, requestOrigin),
    303
  );

  return applyNoStoreHeaders(applyCookies(response));
}
