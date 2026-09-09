import Link from "next/link";
import { Plus } from "lucide-react";

import { PropertyList, type AdminProperty } from "@/components/admin/property-list";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { getMediaProxyUrl, getSupabaseStoragePath } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Imóveis no painel",
  description: "Gestão dos imóveis cadastrados na assessoria.",
  path: "/admin/imoveis",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("properties")
    .select("id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, city, state, updated_at, property_images(url, alt_text, sort_order, is_cover)")
    .order("updated_at", { ascending: false });

  const properties = (data ?? []).map((property) => {
    const images = [...(property.property_images ?? [])].sort((first, second) => first.sort_order - second.sort_order);
    const coverImage = images.find((image) => image.is_cover) ?? images[0] ?? null;
    const storagePath = coverImage ? getSupabaseStoragePath(coverImage.url, "property-images") : null;

    return {
      ...property,
      cover_image_url: coverImage
        ? storagePath
          ? getMediaProxyUrl("property-images", storagePath)
          : coverImage.url
        : null,
      cover_image_alt: coverImage?.alt_text ?? null,
    };
  }) as AdminProperty[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Imóveis"
        title="Cadastro, destaque e publicação dos ativos"
        description="Organize os imóveis e mantenha as informações sempre atualizadas."
        action={
          <Link href="/admin/imoveis/novo" className={buttonVariants({ variant: "gold" })}>
            Novo imóvel
            <Plus className="size-4" />
          </Link>
        }
      />

      <PropertyList initialProperties={properties} />
    </div>
  );
}
