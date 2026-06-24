import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PropertyForm } from "@/components/admin/property-form";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatBrazilianPhoneDisplayNumber } from "@/lib/contact";
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
  property_type: string;
  city: string | null;
  state: string | null;
  address: string | null;
  zip_code: string | null;
  price: number | string | null;
  price_on_request: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  area_total: number | string | null;
  area_useful: number | string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  description: string | null;
  neighborhood: { name: string | null } | { name: string | null }[] | null;
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
      "id, title, slug, transaction_type, property_type, city, state, address, zip_code, price, price_on_request, bedrooms, bathrooms, garages, area_total, area_useful, contact_phone, contact_whatsapp, featured, is_published, seo_title, seo_description, description, neighborhood:neighborhoods(name)"
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

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Edição"
        title={`Editar imóvel ${property.title}`}
        description="O formulário salva diretamente no Supabase e preserva o registro existente."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline" })}>
            Voltar
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <PropertyForm
        action={`/api/admin/properties/${property.id}`}
        redirectTo="/admin/imoveis"
        submitLabel="Salvar alterações"
        title="Dados do imóvel"
        description="Atualize o cadastro quando houver novas informações, valores ou status de publicação."
        values={{
          title: property.title,
          slug: property.slug,
          transactionType: property.transaction_type,
          propertyType: property.property_type,
          city: property.city ?? "",
          state: property.state ?? "",
          neighborhoodName: neighborhood || undefined,
          address: property.address ?? "",
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
          contactPhone: property.contact_phone ? formatBrazilianPhoneDisplayNumber(property.contact_phone) : "",
          contactWhatsapp: property.contact_whatsapp
            ? formatBrazilianPhoneDisplayNumber(property.contact_whatsapp)
            : "",
          featured: property.featured,
          isPublished: property.is_published,
          seoTitle: property.seo_title ?? "",
          seoDescription: property.seo_description ?? "",
          description: property.description ?? "",
        }}
      />
    </div>
  );
}
