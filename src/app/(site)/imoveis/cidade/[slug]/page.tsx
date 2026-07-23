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

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const properties = await getPublicProperties();
  const cities = properties
    .map((property) => property.city)
    .filter((city): city is string => Boolean(city));

  return Array.from(new Set(cities.map(slugify))).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const properties = await getPublicProperties();
  const property = properties.find(
    (item) => item.city && slugify(item.city) === slug
  );

  if (!property?.city) {
    return buildMetadata({
      title: "Cidade não encontrada",
      description: "A cidade solicitada não possui imóveis publicados.",
      path: `/imoveis/cidade/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `Imóveis em ${property.city}`,
    description: `Encontre imóveis em ${property.city} com atendimento próximo e orientação da Luana Modotte Assessoria Imobiliária.`,
    path: `/imoveis/cidade/${slug}`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const properties = await getPublicProperties();
  const matchingProperties = properties.filter(
    (property) => property.city && slugify(property.city) === slug
  );
  const city = matchingProperties[0]?.city;

  if (!city) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Imóveis", path: "/imoveis" },
          { name: city, path: `/imoveis/cidade/${slug}` },
        ])}
      />

      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Busca por cidade"
          title={`Imóveis em ${city}`}
          description={`Conheça as oportunidades publicadas em ${city} e receba apoio para comparar localização, características e condições da negociação.`}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
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
            Não há imóveis publicados nesta cidade no momento.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
