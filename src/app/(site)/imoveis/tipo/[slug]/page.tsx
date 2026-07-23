import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { slugify } from "@/lib/form-utils";
import { getPublicProperties } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";

type PropertyTypePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const properties = await getPublicProperties();

  return Array.from(new Set(properties.map((property) => slugify(property.type)))).map(
    (slug) => ({ slug })
  );
}

export async function generateMetadata({
  params,
}: PropertyTypePageProps): Promise<Metadata> {
  const { slug } = await params;
  const properties = await getPublicProperties();
  const property = properties.find((item) => slugify(item.type) === slug);

  if (!property) {
    return buildMetadata({
      title: "Tipo de imóvel não encontrado",
      description: "A categoria solicitada não possui imóveis publicados.",
      path: `/imoveis/tipo/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${property.type}: imóveis disponíveis`,
    description: `Encontre imóveis do tipo ${property.type} com atendimento e orientação da Luana Modotte Assessoria Imobiliária.`,
    path: `/imoveis/tipo/${slug}`,
  });
}

export default async function PropertyTypePage({ params }: PropertyTypePageProps) {
  const { slug } = await params;
  const properties = await getPublicProperties();
  const matchingProperties = properties.filter((property) => slugify(property.type) === slug);
  const propertyType = matchingProperties[0]?.type;

  if (!propertyType) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Imóveis", path: "/imoveis" },
          { name: propertyType, path: `/imoveis/tipo/${slug}` },
        ])}
      />

      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Tipo de imóvel"
          title={`${propertyType}: imóveis disponíveis`}
          description={`Compare as opções de ${propertyType} e conte com acompanhamento próximo durante toda a negociação.`}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Solicitar atendimento
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {matchingProperties.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>

        {!matchingProperties.length ? (
          <Card className="p-8 text-sm text-brand-ivory/70">
            Não há imóveis publicados nesta categoria no momento.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
