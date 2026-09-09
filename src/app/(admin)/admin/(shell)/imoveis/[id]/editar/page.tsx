import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PropertyForm } from "@/components/admin/property-form";
import type { ManagedPropertyImage } from "@/components/admin/property-image-manager";
import type { ManagedPropertyVideo } from "@/components/admin/property-video-manager";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatBrazilianPhoneDisplayNumber } from "@/lib/contact";
import { getMediaProxyUrl, getSupabaseStoragePath } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

type EditPropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PropertyRecord = {
  id: string;
  title: string;
  slug: string;
  transaction_type: string;
  status: string;
  property_type: string;
  city: string | null;
  state: string | null;
  address: string | null;
  show_full_address: boolean;
  zip_code: string | null;
  price: number | string | null;
  price_on_request: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  area_total: number | string | null;
  area_useful: number | string | null;
  condominium_fee: number | string | null;
  iptu_value: number | string | null;
  built_year: number | null;
  furnished: boolean;
  latitude: number | string | null;
  longitude: number | string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  description: string | null;
  neighborhood: { name: string | null } | { name: string | null }[] | null;
  property_images: Array<{ id: string; url: string; alt_text: string | null; is_cover: boolean }> | null;
  property_videos: Array<{ id: string; url: string; storage_path: string; file_name: string | null; mime_type: string; size_bytes: number; sort_order: number }> | null;
  property_features: Array<{ label: string; value: string | null; sort_order: number }> | null;
};

export const metadata = buildMetadata({
  title: "Editar imóvel",
  description: "Edição base de um imóvel do painel.",
  path: "/admin/imoveis",
  noIndex: true,
});

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, title, slug, transaction_type, property_type, status, city, state, address, show_full_address, zip_code, price, price_on_request, bedrooms, bathrooms, garages, area_total, area_useful, condominium_fee, iptu_value, built_year, furnished, latitude, longitude, contact_phone, contact_whatsapp, featured, is_published, seo_title, seo_description, description, neighborhood:neighborhoods(name), property_images(id, url, alt_text, is_cover), property_videos(id, url, storage_path, file_name, mime_type, size_bytes, sort_order), property_features(label, value, sort_order)"
    )
    .eq("id", id)
    .maybeSingle();

  const property = data as PropertyRecord | null;

  if (!property) {
    notFound();
  }

  const neighborhood = Array.isArray(property.neighborhood)
    ? property.neighborhood[0]?.name ?? ""
    : property.neighborhood?.name ?? "";

  const images = await Promise.all((property.property_images ?? []).map(async (image) => {
    const storagePath = getSupabaseStoragePath(image.url, "property-images");
    const browserImageUrl = storagePath ? getMediaProxyUrl("property-images", storagePath) : image.url;

    return {
      id: image.id,
      url: browserImageUrl,
      altText: image.alt_text,
      isCover: image.is_cover,
    };
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <SectionHeading
          eyebrow="Edição"
          title={`Editar imóvel ${property.title}`}
          description="Preencha as informações do imóvel e revise os dados antes de salvar as alterações."
        />
      </div>

      <PropertyForm
        action={`/api/admin/properties/${property.id}`}
        redirectTo="/admin/imoveis"
        submitLabel="Salvar alterações"
        values={{
          title: property.title,
          slug: property.slug,
          transactionType: property.transaction_type,
          commercialStatus: property.status === "reserved" || property.status === "sold" || property.status === "hidden" ? property.status : "published",
          propertyType: property.property_type,
          city: property.city ?? "",
          state: property.state ?? "",
          neighborhoodName: neighborhood || undefined,
          address: property.address ?? "",
          showFullAddress: property.show_full_address,
          zipCode: property.zip_code ?? "",
          price: property.price === null || property.price === undefined ? "" : String(property.price),
          priceOnRequest: property.price_on_request,
          bedrooms: String(property.bedrooms ?? ""),
          bathrooms: String(property.bathrooms ?? ""),
          garages: String(property.garages ?? ""),
          areaTotal:
            property.area_total === null || property.area_total === undefined
              ? ""
              : String(property.area_total),
          areaUseful:
            property.area_useful === null || property.area_useful === undefined
              ? ""
              : String(property.area_useful),
          condominiumFee:
            property.condominium_fee === null || property.condominium_fee === undefined
              ? ""
              : String(property.condominium_fee),
          iptuValue:
            property.iptu_value === null || property.iptu_value === undefined
              ? ""
              : String(property.iptu_value),
          builtYear: property.built_year ? String(property.built_year) : "",
          furnished: property.furnished,
          latitude: property.latitude === null || property.latitude === undefined ? "" : String(property.latitude),
          longitude: property.longitude === null || property.longitude === undefined ? "" : String(property.longitude),
          contactPhone: property.contact_phone ? formatBrazilianPhoneDisplayNumber(property.contact_phone) : "",
          contactWhatsapp: property.contact_whatsapp
            ? formatBrazilianPhoneDisplayNumber(property.contact_whatsapp)
            : "",
          featured: property.featured,
          isPublished: property.is_published,
          seoTitle: property.seo_title ?? "",
          seoDescription: property.seo_description ?? "",
          description: property.description ?? "",
          features: (property.property_features ?? [])
            .sort((left, right) => left.sort_order - right.sort_order)
            .map((feature) => feature.value ? `${feature.label}: ${feature.value}` : feature.label)
            .join("\n"),
        }}
        images={images as ManagedPropertyImage[]}
        videos={(property.property_videos ?? []).map((video) => ({
          id: video.id,
          url: video.url,
          fileName: video.file_name,
          mimeType: video.mime_type,
          sizeBytes: video.size_bytes,
          sortOrder: video.sort_order,
        })) as ManagedPropertyVideo[]}
      />
    </div>
  );
}
